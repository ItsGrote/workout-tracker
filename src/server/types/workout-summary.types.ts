import type { PersonalRecordEvent } from "@/server/types/personal-record.types";

export type WorkoutSummaryComparison =
  | {
      message: string;
      percentageChange: number;
      previousLabel: string;
      previousVolume: number;
      status: "compared";
    }
  | {
      message: string;
      percentageChange: null;
      previousLabel: string | null;
      previousVolume: number | null;
      status: "no_previous" | "previous_zero";
    };

export type WorkoutSummaryStreak = {
  goal: number;
  trainedDays: number;
};

export type WorkoutSummaryResponse = {
  comparison: WorkoutSummaryComparison;
  personalRecords: PersonalRecordEvent[];
  streaks: {
    monthly: WorkoutSummaryStreak | null;
    weekly: WorkoutSummaryStreak | null;
  };
  totalVolume: number;
  workoutId: string;
};
