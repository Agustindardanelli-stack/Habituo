export interface CycleDay {
  date: string;
  bleeding?: boolean;
  fertile?: boolean;
  symptoms?: string[];
}

export interface CycleInfo {
  lastPeriodStart: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  days: CycleDay[];
}
