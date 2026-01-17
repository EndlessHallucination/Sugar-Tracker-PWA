import { Routes } from '@angular/router';
import { ProgressComponent } from './pages/progress/progress.component';
import { RewardsComponent } from './pages/rewards/rewards.component';
import { TodayComponent } from './pages/today/today.component';
import { StatsComponent } from './pages/stats/stats.component';

export const routes: Routes = [
    { path: '', redirectTo: 'today', pathMatch: 'full' },
    { path: 'today', component: TodayComponent },
    { path: 'progress', component: ProgressComponent },
    { path: 'rewards', component: RewardsComponent },
    { path: 'stats', component: StatsComponent },

];