import { Component, OnInit, signal, inject, computed, OnDestroy } from '@angular/core';
import { FootballService } from '../../services/football';
import { Match, League, ApiResponse } from '../../models/match';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesar pentru [(ngModel)]
import { DatePipe, NgClass } from '@angular/common';
import { Subscription, interval, switchMap, startWith } from 'rxjs';

// Definim tipul pentru gruparea meciurilor
interface LeagueGroup {
  info: League;
  matches: Match[];
}

@Component({
  selector: 'app-live-score',
  standalone: true,
  imports: [FormsModule, DatePipe, NgClass], 
  templateUrl: './live-score.html',
  styleUrl: './live-score.scss'
})
export class LiveScoreComponent implements OnInit, OnDestroy {
  private footballService = inject(FootballService);
  private router = inject(Router);
  
  matches = signal<Match[]>([]);
  isLoading = signal<boolean>(true);
  
  // Data curentă: default AZI, format YYYY-MM-DD
  currentDate = signal<string>(new Date().toISOString().split('T')[0]);
  
  // Variabilă pentru a gestiona abonamentul la timer (pentru a-l opri când plecăm de pe pagină)
  private refreshSubscription?: Subscription;

  // Grupăm meciurile pe Ligi
  groupedMatches = computed(() => {
    const rawMatches = this.matches();
    const grouped: { [key: string]: LeagueGroup } = {};
    rawMatches.forEach(match => {
      const leagueName = match.league.name + match.league.country;
      if (!grouped[leagueName]) grouped[leagueName] = { info: match.league, matches: [] };
      grouped[leagueName].matches.push(match);
    });
    return Object.values(grouped) as LeagueGroup[];
  });

  ngOnInit() {
    this.startLiveRefresh();
  }

  startLiveRefresh() {
    this.isLoading.set(true);
    // Dacă există deja un refresh activ, îl oprim înainte să pornim altul
    if (this.refreshSubscription) this.refreshSubscription.unsubscribe();

    // RxJS Interval: Rulează la fiecare 60 secunde (60000 ms)
    this.refreshSubscription = interval(60000)
      .pipe(
        startWith(0), // Execută imediat, nu aștepta 60s prima dată
        switchMap(() => {
            const today = new Date().toISOString().split('T')[0];
            const isToday = this.currentDate() === today;
            // Dacă data selectată e Azi, trimitem undefined (API-ul va da meciuri LIVE). 
            // Dacă e altă dată, cerem acea dată specifică.
            return this.footballService.getMatches(isToday ? undefined : this.currentDate());
        })
      )
      .subscribe({
        next: (data: ApiResponse) => {
          this.matches.set(data.response);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
  }

  // Când utilizatorul schimbă data din calendar
  onDateChange() {
    this.startLiveRefresh();
  }

  // Navigare la detalii
  goToMatch(id: number) {
    this.router.navigate(['/match', id]);
  }

  // Curățăm memoria când componenta e distrusă
  ngOnDestroy() {
    if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
  }
}