export interface Reward {
    id: string;
    title: string;
    description?: string;
    cost: number;
    redeemed: boolean;
    icon?: string; // Emoji or icon identifier
    category?: 'treat' | 'activity' | 'purchase' | 'experience';
}