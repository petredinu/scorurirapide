import { Routes } from '@angular/router';
import { LiveScoreComponent } from './components/live-score/live-score';

export const routes: Routes = [
  { path: '', component: LiveScoreComponent },
  // Aici vei adăuga ruta pentru detalii meci în viitor
  // { path: 'match/:id', component: MatchDetailComponent }
];