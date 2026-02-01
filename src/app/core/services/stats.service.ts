
import { inject, Injectable } from '@angular/core';
import { GameStateService } from './game-state.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  game = inject(GameStateService);

  getSugarFreePercentageThisMonth(): number {
    const logs = this.game.getLogs();
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthLogs = logs.filter(l => {
      const d = new Date(l.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    if (monthLogs.length === 0) return 0;

    const sugarFree = monthLogs.filter(l => !l.ateSugar).length;
    return Math.round((sugarFree / monthLogs.length) * 100);
  }

  getLongestStreak(): number {
    const logs = [...this.game.getLogs()]
      .sort((a, b) => a.date.localeCompare(b.date));

    let max = 0;
    let current = 0;

    for (const log of logs) {
      if (!log.ateSugar) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    }

    return max;
  }

  getAverageSugarFreePerWeek(): number {
    const logs = this.game.getLogs();
    if (logs.length === 0) return 0;

    const weeks = new Map<string, number>();

    logs.forEach(l => {
      const d = new Date(l.date);
      const weekKey = `${d.getFullYear()}-${this.getWeekNumber(d)}`;
      if (!weeks.has(weekKey)) weeks.set(weekKey, 0);
      if (!l.ateSugar) weeks.set(weekKey, weeks.get(weekKey)! + 1);
    });

    const total = Array.from(weeks.values()).reduce((a, b) => a + b, 0);
    return Math.round((total / weeks.size) * 10) / 10;
  }

  private getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const diff = +date - +firstDay;
    return Math.ceil((diff / 86400000 + firstDay.getDay() + 1) / 7);
  }
}