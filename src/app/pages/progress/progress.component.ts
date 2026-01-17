import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-progress',
  imports: [],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss'
})
export class ProgressComponent {
  game = inject(GameStateService);

  get logs() {
    return [...this.game.getLogs()]
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}