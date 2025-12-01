import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/match';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FootballService {
  private http = inject(HttpClient);
  // Fallback dacă environment nu e setat, folosim URL-ul default
  private apiUrl = environment.apiUrl || 'https://v3.football.api-sports.io';
  
  private headers = new HttpHeaders({
    'x-rapidapi-key': environment.apiKey || '',
    'x-rapidapi-host': 'v3.football.api-sports.io'
  });

  // --- MECANISM CACHE ---
  // Stocăm răspunsurile aici: Key = URL, Value = { data, expiry }
  private cache = new Map<string, { data: any, expiry: number }>();
  private CACHE_DURATION = 60 * 1000; // 1 minut (60 secunde)

  // Funcție generică care verifică cache-ul înainte de a face apel HTTP
  private getWithCache<T>(url: string, params: HttpParams): Observable<T> {
    const cacheKey = `${url}?${params.toString()}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Dacă avem date în cache și nu au expirat, le returnăm direct (fără apel API)
    if (cached && cached.expiry > now) {
      return of(cached.data);
    }

    // Altfel, facem cererea și salvăm rezultatul în cache
    return this.http.get<T>(url, { headers: this.headers, params }).pipe(
      tap(data => {
        this.cache.set(cacheKey, { data, expiry: now + this.CACHE_DURATION });
      })
    );
  }

  // --- METODE API ---

  // 1. Obține lista de meciuri (Live sau după dată)
  getMatches(date?: string): Observable<ApiResponse> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    } else {
      params = params.set('live', 'all');
    }
    // Pentru lista principală nu folosim cache agresiv pentru a avea scoruri live
    return this.http.get<ApiResponse>(`${this.apiUrl}/fixtures`, { headers: this.headers, params });
  }

  // 2. Obține Statistici Meci (ex: Posesie, Șuturi) - Folosește Cache
  getMatchStatistics(fixtureId: number): Observable<any> {
    const params = new HttpParams().set('fixture', fixtureId);
    return this.getWithCache(`${this.apiUrl}/fixtures/statistics`, params);
  }

  // 3. Obține Echipele de Start (Lineups) - Folosește Cache
  getMatchLineups(fixtureId: number): Observable<any> {
    const params = new HttpParams().set('fixture', fixtureId);
    return this.getWithCache(`${this.apiUrl}/fixtures/lineups`, params);
  }
}