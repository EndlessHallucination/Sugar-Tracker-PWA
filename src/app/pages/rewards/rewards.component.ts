import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-rewards',
  imports: [],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.scss'
})
export class RewardsComponent {

  game = inject(GameStateService);


  redeem(id: string) {
    this.game.redeemReward(id)
  }

  canRedeem(cost: number, redeemed: boolean) {
    return !redeemed && this.game.getTotalPoints() >= cost;
  }
}
