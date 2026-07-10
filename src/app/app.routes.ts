import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { FamilyTracker } from './pages/family-tracker/family-tracker';
import { Join } from './pages/family-tracker/join/join';
import { Gate } from './pages/family-tracker/gate/gate';
import { ownerAuthGuard } from './guards/owner-auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'family-tracker/unlock', component: Gate },
  { path: 'family-tracker', component: FamilyTracker, canActivate: [ownerAuthGuard] },
  { path: 'family-tracker/join/:id', component: Join },
  { path: '**', redirectTo: '' },
];