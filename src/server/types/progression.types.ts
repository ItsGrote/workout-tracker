export type ProgressionPoint = {
  date: string;
  label: string;
  totalVolume: number;
  exerciseName?: string;
  workoutCategory?: string | null;
};

export type ProgressionFilters = {
  exerciseName?: string;
  category?: string;
  fromDate?: Date;
  toDate?: Date;
};

export type ProgressionResponse = {
  filters: {
    exerciseName?: string;
    category?: string;
    fromDate?: string;
    toDate?: string;
  };
  totalVolume: number;
  points: ProgressionPoint[];
};

