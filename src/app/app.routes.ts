
import { Routes } from '@angular/router';
import { appInitGuard } from './core/guards/app-init.guard';
import { TodayComponent } from './pages/today/today.component';
import { StatsComponent } from './pages/stats/stats.component';
import { RewardsComponent } from './pages/rewards/rewards.component';
import { ProgressComponent } from './pages/progress/progress.component';

export const routes: Routes = [
    {
        path: '',
        canActivate: [appInitGuard],   // runs once, blocks until DB is loaded
        children: [
            { path: '', component: TodayComponent },
            { path: 'stats', component: StatsComponent },
            { path: 'rewards', component: RewardsComponent },
            { path: 'progress', component: ProgressComponent },
        ]
    }
];