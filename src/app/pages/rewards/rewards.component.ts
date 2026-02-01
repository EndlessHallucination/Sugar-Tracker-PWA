// src/app/pages/rewards/rewards.component.ts

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

  async redeem(id: string) {
    await this.game.redeemReward(id);
  }

  canRedeem(cost: number, rewardId: string): boolean {
    return !this.game.isRedeemed(rewardId) && this.game.getTotalPoints() >= cost;
  }
}