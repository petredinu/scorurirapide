import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FootballService } from '../../services/football';
import { Match, League, ApiResponse } from '../../models/match';
// Am sters DatePipe si NgClass pentru ca momentan nu le folosim explicit in HTML-ul simplu
// si cauzau eroarea de "unused import".

// 1. Definim o interfață pentru a ști TypeScript-ul cum arată un grup
interface LeagueGroup {
  info: League;
  matches: Match[];
}

@Component({
  selector: 'app-live-score',
  standalone: true,
  imports: [], // Lista de importuri este goală momentan pentru a scăpa de eroare
  templateUrl: './live-score.html',
  styleUrl: './live-score.scss'
})
export class LiveScoreComponent implements OnInit {
  private footballService = inject(FootballService);
  
  matches = signal<Match[]>([]);
  isLoading = signal<boolean>(true);

  // 2. Aici specificăm explicit tipul returnat: LeagueGroup[]
  groupedMatches = computed(() => {
    const rawMatches = this.matches();
    const grouped: { [key: string]: LeagueGroup } = {};

    rawMatches.forEach(match => {
      // Cheia unică pentru grupare (Nume Liga + Țară)
      const leagueName = match.league.name + match.league.country;
      
      if (!grouped[leagueName]) {
        grouped[leagueName] = { 
          info: match.league, 
          matches: [] 
        };
      }
      grouped[leagueName].matches.push(match);
    });

    // 3. Transformăm obiectul în Array și folosim 'as' pentru a garanta tipul
    return Object.values(grouped) as LeagueGroup[];
  });

  ngOnInit() {
    this.loadLiveMatches();
  }

  loadLiveMatches() {
    this.footballService.getLiveMatches().subscribe({
      next: (data: ApiResponse) => {
        this.matches.set(data.response);
        this.isLoading.set(false);
      },
      error: (err:any) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}