export interface DailyRecord {
  date: string; // ISO Date string YYYY-MM-DD
  morning: boolean;
  evening: boolean;
}

export interface QuoteData {
  text: string;
  source?: string;
  fetchedAt: number; // Timestamp
}

export interface AppState {
  records: DailyRecord[];
  currentStreak: number;
  longestStreak: number;
  lastQuote?: QuoteData;
}

export enum ZenLevel {
  SEED = 0,
  SPROUT = 1,
  SAPLING = 2,
  TREE = 3,
  BLOOM = 4,
  FOREST = 5
}