// src/app/pages/today/today.component.ts

import { Component, inject, computed } from '@angular/core';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-today',
  imports: [],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss'
})
export class TodayComponent {
  game = inject(GameStateService);

  last7Days = computed(() => {
    const logs = this.game.getLogs();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = logs.find(l => l.date === dateStr);

      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        status: log ? (log.ateSugar ? 'fail' : 'success') : 'empty'
      });
    }

    return days;
  });

  get todayLog() {
    return this.game.getTodayLog();
  }

  async mark(ateSugar: boolean) {
    await this.game.setTodaySugar(ateSugar);
  }
}