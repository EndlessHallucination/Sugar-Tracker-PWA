import { DayLog } from "./day-log.model";
import { Reward } from "./reward.model";

export interface AppState {
    logs: DayLog[];
    rewards: Reward[];
    pointsSpent: number;

}