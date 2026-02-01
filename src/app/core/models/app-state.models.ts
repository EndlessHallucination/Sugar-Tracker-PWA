// src/app/core/models/app-state.models.ts

export interface AppState {
    logs: DayLog[];
    rewards: Reward[];
    redeemedIds: Set<string>;   // replaces pointsSpent + reward.redeemed
}

export interface DayLog {
    date: string;        // YYYY-MM-DD
    ateSugar: boolean;
    points: number;
}

export interface Reward {
    id: string;
    title: string;
    description?: string;
    cost: number;
    icon?: string;
    category?: 'treat' | 'activity' | 'purchase' | 'experience';
    // NOTE: no more `redeemed` boolean here — that lives in redeemedIds
}