import { Injectable, signal } from '@angular/core';
import { AppState } from '../models/app-state.models';
import { Reward } from '../models/reward.model';

const STORAGE_KEY = 'sugar-game-state';
const DEFAULT_REWARDS: Reward[] = [
  { id: 'm1', title: 'Fancy Coffee', cost: 30, icon: '☕', redeemed: false },
  { id: 'm2', title: '30 min Guilt-Free Scrolling', cost: 40, icon: '📱', redeemed: false },
  { id: 'm3', title: 'Planned Dessert', cost: 50, icon: '🍰', redeemed: false },
  { id: 'm4', title: 'Sleep In Tomorrow', cost: 80, icon: '😴', redeemed: false },
  { id: 'm5', title: 'Skip One Workout (No Guilt)', cost: 60, icon: '🧘', redeemed: false },
  { id: 'm6', title: 'Favorite Takeout', cost: 70, icon: '🍕', redeemed: false },
  { id: 'm7', title: 'New Nail Polish', cost: 50, icon: '💅', redeemed: false },
  { id: 'm8', title: 'Bubble Bath Night', cost: 40, icon: '🛁', redeemed: false },

  // 🎬 MEDIUM REWARDS (100-300 points)
  { id: 'd1', title: 'Movie Night', cost: 150, icon: '🎬', redeemed: false },
  { id: 'd2', title: 'Massage', cost: 250, icon: '💆', redeemed: false },
  { id: 'd3', title: 'New Underwear / Leggings', cost: 200, icon: '🩲', redeemed: false },
  { id: 'd4', title: 'Do Nothing Evening', cost: 120, icon: '🛋️', redeemed: false },
  { id: 'd5', title: 'Date Night', cost: 300, icon: '❤️', redeemed: false },
  { id: 'd6', title: 'Partner Chooses Activity', cost: 200, icon: '🎲', redeemed: false },
  { id: 'd7', title: 'New Book or Magazine', cost: 150, icon: '📚', redeemed: false },
  { id: 'd8', title: 'Face Masks & Skincare', cost: 180, icon: '🧴', redeemed: false },
  { id: 'd9', title: 'Brunch Out', cost: 220, icon: '🥞', redeemed: false },
  { id: 'd10', title: 'Concert or Show Tickets', cost: 280, icon: '🎭', redeemed: false },

  // ✈️ MACRO (500+)
  { id: 'x1', title: 'Shoes', cost: 800, icon: '👟', redeemed: false },
  { id: 'x2', title: 'Weekend Trip Fund', cost: 1000, icon: '✈️', redeemed: false },
  { id: 'x3', title: 'Shared Experience Fund', cost: 500, icon: '👫', redeemed: false },
  { id: 'x4', title: 'New Tech Gadget', cost: 900, icon: '📱', redeemed: false },
  { id: 'x5', title: 'Spa Day', cost: 600, icon: '💆‍♀️', redeemed: false },
  { id: 'x6', title: 'Nice Dinner Out', cost: 400, icon: '🍽️', redeemed: false },
  { id: 'x7', title: 'Full Day Off (No Chores)', cost: 700, icon: '🏖️', redeemed: false },
  { id: 'x8', title: 'Shopping Spree ($100)', cost: 1200, icon: '🛍️', redeemed: false },


];

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  state = signal<AppState>(this.loadState());
  currentDate = signal(this.today());
  // Getter for rewards
  getRewards(): Reward[] {
    return this.state().rewards;
  }

  // Getter for logs
  getLogs() {
    return this.state().logs;
  }

  getTodayLog() {
    const today = this.currentDate();
    return this.state().logs.find(l => l.date === today) ?? null;
  }

  setTodaySugar(ateSugar: boolean) {
    const today = this.today();
    const logs = [...this.state().logs];

    const points = ateSugar ? -10 : 10;
    const existingIndex = logs.findIndex(l => l.date === today);

    if (existingIndex >= 0) {
      logs[existingIndex] = { date: today, ateSugar, points };
    } else {
      logs.push({
        date: today, ateSugar, points
      })
    }
    this.updateState({ logs })
  }

  getTotalPoints(): number {
    const earned = this.state().logs.reduce((s, l) => s + l.points, 0);
    return earned - this.state().pointsSpent;
  }

  getCurrentStreak() {
    const logs = [...this.state().logs].sort((a, b) => a.date.localeCompare(b.date));

    let streak = 0;

    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].ateSugar) break;
      streak++;
    }

    return streak;
  }

  redeemReward(id: string): void {
    const rewards = [...this.state().rewards];
    const reward = rewards.find(r => r.id === id);

    if (!reward || reward.redeemed) return;
    if (this.getTotalPoints() < reward.cost) return;

    reward.redeemed = true;

    this.updateState({
      rewards,
      pointsSpent: this.state().pointsSpent + reward.cost
    });
  }

  // Method to reset a redeemed reward (for testing or if you want to allow re-redemption)
  resetReward(id: string): void {
    const rewards = [...this.state().rewards];
    const reward = rewards.find(r => r.id === id);

    if (!reward || !reward.redeemed) return;

    reward.redeemed = false;

    this.updateState({
      rewards,
      pointsSpent: this.state().pointsSpent - reward.cost
    });
  }

  private updateState(partial: Partial<AppState>) {
    const newState = { ...this.state(), ...partial };
    this.state.set(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }

  private loadState(): AppState {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        logs: [],
        rewards: DEFAULT_REWARDS,
        pointsSpent: 0
      };
    }

    try {
      const parsed = JSON.parse(raw);

      return {
        logs: parsed.logs ?? [],
        rewards: parsed.rewards ?? DEFAULT_REWARDS,
        pointsSpent: parsed.pointsSpent ?? 0
      };
    } catch {
      return {
        logs: [],
        rewards: DEFAULT_REWARDS,
        pointsSpent: 0
      };
    }
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }
}