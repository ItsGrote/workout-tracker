import { personalRecordRepository } from "@/server/repositories/personal-record.repository";
import type {
  PersonalRecord,
  PersonalRecordEvent,
  PersonalRecordMetric,
  PersonalRecordsResponse,
  PersonalRecordScope,
} from "@/server/types/personal-record.types";
import type { PersonalRecordFiltersInput } from "@/server/validations/personal-record.validation";
import {
  calculateExerciseVolume,
  calculateWorkoutVolume,
  roundMetric,
} from "@/server/services/workout-metrics";

type RecordSourceWorkout = Awaited<
  ReturnType<typeof personalRecordRepository.findRecordSources>
>[number];

type RecordSourceExercise = RecordSourceWorkout["exercises"][number];
type BestRecordState = {
  value: number;
  record: PersonalRecord;
};

type Candidate = {
  key: string;
  metric: PersonalRecordMetric;
  scope: PersonalRecordScope;
  value: number;
  date: Date;
  message: string;
  exerciseName?: string;
  workoutName?: string;
  workoutCategory?: string | null;
  workoutId?: string;
  exerciseId?: string;
};

const normalizeKey = (value: string) => value.trim().toLowerCase();

const formatDate = (date: Date) => date.toISOString();

const formatFilters = (filters: PersonalRecordFiltersInput) => ({
  workoutId: filters.workoutId,
  exerciseName: filters.exerciseName,
  workoutCategory: filters.workoutCategory,
  fromDate: filters.fromDate?.toISOString(),
  toDate: filters.toDate?.toISOString(),
});

const toRecord = (candidate: Candidate): PersonalRecord => ({
  metric: candidate.metric,
  scope: candidate.scope,
  value: roundMetric(candidate.value),
  date: formatDate(candidate.date),
  message: candidate.message,
  exerciseName: candidate.exerciseName,
  workoutName: candidate.workoutName,
  workoutCategory: candidate.workoutCategory,
  workoutId: candidate.workoutId,
  exerciseId: candidate.exerciseId,
});

const toEvent = (
  candidate: Candidate,
  previousValue: number | null,
): PersonalRecordEvent => ({
  ...toRecord(candidate),
  previousValue: previousValue === null ? null : roundMetric(previousValue),
});

const isInsideEventWindow = (
  date: Date,
  filters: PersonalRecordFiltersInput,
) =>
  (!filters.fromDate || date.getTime() >= filters.fromDate.getTime()) &&
  (!filters.toDate || date.getTime() <= filters.toDate.getTime());

const belongsToWorkoutFilter = (
  candidate: Candidate,
  filters: PersonalRecordFiltersInput,
) => !filters.workoutId || candidate.workoutId === filters.workoutId;

const pushIfValid = (candidates: Candidate[], candidate: Candidate) => {
  if (candidate.value > 0) {
    candidates.push(candidate);
  }
};

const createExerciseCandidates = (
  workout: RecordSourceWorkout,
  exercise: RecordSourceExercise,
): Candidate[] => {
  const exerciseKey = normalizeKey(exercise.name);
  const candidates: Candidate[] = [];

  const maxWeight = Math.max(
    0,
    ...exercise.sets.map((set) => Number(set.weightKg)),
  );
  const maxRepetitions = Math.max(
    0,
    ...exercise.sets.map((set) => set.repetitions),
  );
  const exerciseVolume = calculateExerciseVolume(exercise);

  pushIfValid(candidates, {
    key: `exercise:${exerciseKey}:highest-weight`,
    metric: "highest-weight",
    scope: "exercise",
    value: maxWeight,
    date: workout.date,
    message: `New ${exercise.name} weight record!`,
    exerciseName: exercise.name,
    workoutName: workout.name,
    workoutCategory: workout.category,
    workoutId: workout.id,
    exerciseId: exercise.id,
  });

  pushIfValid(candidates, {
    key: `exercise:${exerciseKey}:best-repetitions`,
    metric: "best-repetitions",
    scope: "exercise",
    value: maxRepetitions,
    date: workout.date,
    message: `New ${exercise.name} repetition record!`,
    exerciseName: exercise.name,
    workoutName: workout.name,
    workoutCategory: workout.category,
    workoutId: workout.id,
    exerciseId: exercise.id,
  });

  pushIfValid(candidates, {
    key: `exercise:${exerciseKey}:exercise-volume`,
    metric: "exercise-volume",
    scope: "exercise",
    value: exerciseVolume,
    date: workout.date,
    message: `New ${exercise.name} volume record!`,
    exerciseName: exercise.name,
    workoutName: workout.name,
    workoutCategory: workout.category,
    workoutId: workout.id,
    exerciseId: exercise.id,
  });

  return candidates;
};

const createWorkoutCandidates = (workout: RecordSourceWorkout): Candidate[] => {
  const candidates: Candidate[] = [];
  const workoutVolume = calculateWorkoutVolume(workout);

  pushIfValid(candidates, {
    key: "workout:volume",
    metric: "workout-volume",
    scope: "workout",
    value: workoutVolume,
    date: workout.date,
    message: `New workout volume record: ${workout.name}!`,
    workoutName: workout.name,
    workoutCategory: workout.category,
    workoutId: workout.id,
  });

  if (workout.category) {
    pushIfValid(candidates, {
      key: `category:${normalizeKey(workout.category)}:workout-volume`,
      metric: "category-workout-volume",
      scope: "category",
      value: workoutVolume,
      date: workout.date,
      message: `New ${workout.category} volume record!`,
      workoutName: workout.name,
      workoutCategory: workout.category,
      workoutId: workout.id,
    });
  }

  return candidates;
};

export const personalRecordService = {
  async getPersonalRecords(
    userId: string,
    filters: PersonalRecordFiltersInput,
  ): Promise<PersonalRecordsResponse> {
    const workouts = await personalRecordRepository.findRecordSources({
      userId,
      exerciseName: filters.exerciseName,
      workoutCategory: filters.workoutCategory,
      toDate: filters.toDate,
    });

    const bestRecords = new Map<string, BestRecordState>();
    const newRecords: PersonalRecordEvent[] = [];

    for (const workout of workouts) {
      const candidates = [
        ...workout.exercises.flatMap((exercise) =>
          createExerciseCandidates(workout, exercise),
        ),
        ...createWorkoutCandidates(workout),
      ];

      for (const candidate of candidates) {
        const currentBest = bestRecords.get(candidate.key);

        if (!currentBest || candidate.value > currentBest.value) {
          if (
            isInsideEventWindow(candidate.date, filters) &&
            belongsToWorkoutFilter(candidate, filters)
          ) {
            newRecords.push(
              toEvent(candidate, currentBest ? currentBest.value : null),
            );
          }

          bestRecords.set(candidate.key, {
            value: candidate.value,
            record: toRecord(candidate),
          });
        }
      }
    }

    return {
      filters: formatFilters(filters),
      records: Array.from(bestRecords.values()).map((entry) => entry.record),
      newRecords,
    };
  },
};
