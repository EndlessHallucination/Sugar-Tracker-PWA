// src/app/core/services/supabase.service.ts

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { DayLog, Reward } from '../models/app-state.models';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {

    private client: SupabaseClient;

    constructor() {
        this.client = createClient(
            environment.supabase.url,
            environment.supabase.key,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                }
            }
        );
    }

    // ─── DAY LOGS ─────────────────────────────────────────────

    async getAllLogs(): Promise<DayLog[]> {
        const { data, error } = await this.client
            .from('day_logs')
            .select('date, ate_sugar, points')
            .order('date', { ascending: true });

        if (error) {
            console.error('Failed to fetch logs:', error);
            return [];
        }

        // DB uses snake_case, app uses camelCase — map here
        return data.map((row: any) => ({
            date: row.date as string,       // comes back as 'YYYY-MM-DD' string
            ateSugar: row.ate_sugar as boolean,
            points: row.points as number
        }));
    }

    async upsertLog(log: DayLog): Promise<void> {
        const { error } = await this.client
            .from('day_logs')
            .upsert(
                {
                    date: log.date,
                    ate_sugar: log.ateSugar,
                    points: log.points
                },
                { onConflict: 'date' }   // if same date exists, update it
            );

        if (error) {
            console.error('Failed to save log:', error);
            throw error;                // let the caller know it failed
        }
    }

    // ─── REWARDS ──────────────────────────────────────────────

    async getAllRewards(): Promise<Reward[]> {
        const { data, error } = await this.client
            .from('rewards')
            .select('*')
            .order('cost', { ascending: true });

        if (error) {
            console.error('Failed to fetch rewards:', error);
            return [];
        }

        return data.map((row: any) => ({
            id: row.id as string,
            title: row.title as string,
            description: row.description as string | undefined,
            cost: row.cost as number,
            icon: row.icon as string | undefined,
            category: row.category as Reward['category'] | undefined
        }));
    }

    // ─── REDEMPTIONS ──────────────────────────────────────────

    async getRedeemedRewardIds(): Promise<string[]> {
        const { data, error } = await this.client
            .from('reward_redemptions')
            .select('reward_id');

        if (error) {
            console.error('Failed to fetch redemptions:', error);
            return [];
        }

        return data.map((row: any) => row.reward_id as string);
    }

    async redeemReward(rewardId: string): Promise<void> {
        const { error } = await this.client
            .from('reward_redemptions')
            .insert({ reward_id: rewardId });

        if (error) {
            console.error('Failed to redeem reward:', error);
            throw error;
        }
    }

    async unredeemReward(rewardId: string): Promise<void> {
        const { error } = await this.client
            .from('reward_redemptions')
            .delete()
            .eq('reward_id', rewardId);

        if (error) {
            console.error('Failed to unredeem reward:', error);
            throw error;
        }
    }
}