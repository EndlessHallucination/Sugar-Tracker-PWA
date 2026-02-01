// src/app/pages/stats/stats.component.ts

import { Component, inject, computed } from '@angular/core';
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

  // All of these are now computed signals — they react to state changes automatically
  sugarFreePercent = computed(() => this.stats.getSugarFreePercentageThisMonth());
  longestStreak   = computed(() => this.stats.getLongestStreak());
  avgPerWeek      = computed(() => this.stats.getAverageSugarFreePerWeek());

  monthDays = computed(() => this.buildMonthHeatmap());

  getStreakProgress(target: number): number {
    const streak = this.game.getCurrentStreak();
    return Math.min(100, Math.round((streak / target) * 100));
  }

  private buildMonthHeatmap(): { date: string; status: DayStatus }[] {
    const logs = this.game.getLogs();   // reads signal → this computed is now tracked
    const map = new Map<string, 'success' | 'fail'>();

    logs.forEach(l => {
      map.set(l.date, l.ateSugar ? 'fail' : 'success');
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const days: { date: string; status: DayStatus }[] = [];

    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d).toISOString().split('T')[0];
      days.push({ date, status: map.get(date) ?? 'empty' });
    }

    return days;
  }

}