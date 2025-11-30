import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { ApiResponse } from '../models/match';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FootballService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private headers = new HttpHeaders({
    'x-rapidapi-key': environment.apiKey,
    'x-rapidapi-host': 'v3.football.api-sports.io'
  });

  // Obține meciurile live
  getLiveMatches(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/fixtures`, {
      headers: this.headers,
      params: new HttpParams().set('live', 'all')
    });
  }

  // Obține meciurile pentru o anumită dată (ex: azi)
  getMatchesByDate(date: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/fixtures`, {
      headers: this.headers,
      params: new HttpParams().set('date', date)
    });
  }
}