import { Component, inject } from '@angular/core';
import { StatsService } from '../../core/services/stats.service';
import { GameStateService } from '../../core/services/game-state.service';

type DayStatus = 'success' | 'fail' | 'empty';

@Component({
  selector: 'app-stats',
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {

  stats = inject(StatsService);
  game = inject(GameStateService);

  sugarFreePercent = this.stats.getSugarFreePercentageThisMonth();
  longestStreak = this.stats.getLongestStreak();
  avgPerWeek = this.stats.getAverageSugarFreePerWeek();


  getStreakProgress(target: number): number {
    const streak = this.game.getCurrentStreak();
    return Math.min(100, Math.round((streak / target) * 100));
  }

  // ====== HEATMAP ======

  monthDays = this.buildMonthHeatmap();

  private buildMonthHeatmap() {
    const map = this.getMonthHeatmap();
    const days: { date: string; status: DayStatus }[] = [];

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d)
        .toISOString()
        .split('T')[0];

      days.push({
        date,
        status: map.get(date) ?? 'empty'
      });
    }

    return days;
  }

  private getMonthHeatmap(): Map<string, 'success' | 'fail'> {
    const map = new Map<string, 'success' | 'fail'>();

    this.game.getLogs().forEach(l => {
      map.set(l.date, l.ateSugar ? 'fail' : 'success');
    });

    return map;
  }

  private getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const diff = +date - +firstDay;
    return Math.ceil((diff / 86400000 + firstDay.getDay() + 1) / 7);
  }
}
