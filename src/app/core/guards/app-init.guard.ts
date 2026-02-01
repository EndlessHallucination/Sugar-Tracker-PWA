
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { GameStateService } from '../services/game-state.service';

export const appInitGuard: CanActivateFn = async () => {
    const game = inject(GameStateService);
    await game.initState();
    return true;
};