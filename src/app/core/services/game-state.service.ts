// src/app/core/services/game-state.service.ts

import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AppState, DayLog, Reward } from '../models/app-state.models';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  state = signal<AppState>({
    logs: [],
    rewards: [],
    redeemedIds: new Set<string>()
  });

  private initialized = false;

  constructor(private supabase: SupabaseService) {}

  // ─── INIT (call once on app start) ────────────────────────

  async initState(): Promise<void> {
    if (this.initialized) return;

    const [logs, rewards, redeemedIds] = await Promise.all([
      this.supabase.getAllLogs(),
      this.supabase.getAllRewards(),
      this.supabase.getRedeemedRewardIds()
    ]);

    this.state.set({
      logs,
      rewards,
      redeemedIds: new Set(redeemedIds)
    });

    this.initialized = true;
  }

  // ─── GETTERS ──────────────────────────────────────────────

  getLogs(): DayLog[] {
    return this.state().logs;
  }

  getRewards(): Reward[] {
    return this.state().rewards;
  }

  getTodayLog(): DayLog | null {
    const today = this.today();
    return this.state().logs.find(l => l.date === today) ?? null;
  }

  // ─── TODAY'S LOGGING ──────────────────────────────────────

  async setTodaySugar(ateSugar: boolean): Promise<void> {
    const today = this.today();
    const points = ateSugar ? -10 : 10;
    const newLog: DayLog = { date: today, ateSugar, points };

    // Write to DB first
    await this.supabase.upsertLog(newLog);

    // Then update local signal
    const logs = [...this.state().logs];
    const existingIndex = logs.findIndex(l => l.date === today);

    if (existingIndex >= 0) {
      logs[existingIndex] = newLog;
    } else {
      logs.push(newLog);
    }

    this.state.set({ ...this.state(), logs });
  }

  // ─── POINTS ───────────────────────────────────────────────

  getTotalPoints(): number {
    const earned = this.state().logs.reduce((sum, l) => sum + l.points, 0);
    return earned - this.getPointsSpent();
  }

  private getPointsSpent(): number {
    const { rewards, redeemedIds } = this.state();
    let spent = 0;
    for (const id of redeemedIds) {
      const reward = rewards.find(r => r.id === id);
      if (reward) spent += reward.cost;
    }
    return spent;
  }

  // ─── STREAK (fixed: checks consecutive dates) ────────────

  getCurrentStreak(): number {
    const logs = this.state().logs;
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find(l => l.date === dateStr);

      if (!log) break;          // no entry → streak ends
      if (log.ateSugar) break;  // ate sugar → streak ends
      streak++;
    }

    return streak;
  }

  // ─── REWARDS ──────────────────────────────────────────────

  isRedeemed(rewardId: string): boolean {
    return this.state().redeemedIds.has(rewardId);
  }

  async redeemReward(id: string): Promise<void> {
    const reward = this.state().rewards.find(r => r.id === id);
    if (!reward || this.isRedeemed(id)) return;
    if (this.getTotalPoints() < reward.cost) return;

    await this.supabase.redeemReward(id);

    const redeemedIds = new Set(this.state().redeemedIds);
    redeemedIds.add(id);
    this.state.set({ ...this.state(), redeemedIds });
  }

  async resetReward(id: string): Promise<void> {
    if (!this.isRedeemed(id)) return;

    await this.supabase.unredeemReward(id);

    const redeemedIds = new Set(this.state().redeemedIds);
    redeemedIds.delete(id);
    this.state.set({ ...this.state(), redeemedIds });
  }

  // ─── PRIVATE ──────────────────────────────────────────────

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }
}