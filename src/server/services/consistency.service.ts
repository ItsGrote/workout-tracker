import { consistencyRepository } from "@/server/repositories/consistency.repository";
import { goalRepository } from "@/server/repositories/goal.repository";
import type {
  ConsistencyHistoryItem,
  ConsistencyPeriod,
  ConsistencyResponse,
  MonthlyConsistency,
  WeekStatus,
} from "@/server/types/consistency.types";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const endOfUtcDay = (date: Date) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

const startOfIsoWeek = (date: Date) => {
  const day = startOfUtcDay(date);
  const utcDay = day.getUTCDay();
  const daysFromMonday = utcDay === 0 ? 6 : utcDay - 1;

  return new Date(day.getTime() - daysFromMonday * DAY_MS);
};

const endOfIsoWeek = (date: Date) =>
  endOfUtcDay(new Date(startOfIsoWeek(date).getTime() + 6 * DAY_MS));

const startOfUtcMonth = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const endOfUtcMonth = (date: Date) =>
  endOfUtcDay(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));

const formatDate = (date: Date) => date.toISOString();

const toDayKey = (date: Date) => startOfUtcDay(date).toISOString().slice(0, 10);

const countTrainedDays = (dates: Date[], startDate: Date, endDate: Date) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const days = new Set<string>();

  for (const date of dates) {
    const time = date.getTime();

    if (time >= start && time <= end) {
      days.add(toDayKey(date));
    }
  }

  return days.size;
};

const calculatePercentage = (trainedDays: number, goal: number | null) => {
  if (!goal) {
    return 0;
  }

  return Math.min(100, Math.round((trainedDays / goal) * 100));
};

const calculateRemaining = (trainedDays: number, goal: number | null) => {
  if (!goal) {
    return null;
  }

  return Math.max(goal - trainedDays, 0);
};

const resolveWeekStatus = (
  trainedDays: number,
  goal: number | null,
  weekEnd: Date,
  currentWeekStart: Date,
) : WeekStatus => {
  if (!goal || weekEnd.getTime() >= currentWeekStart.getTime()) {
    return "in_progress";
  }

  return trainedDays >= goal ? "completed" : "failed";
};

const buildWeekPeriod = (
  dates: Date[],
  weekStart: Date,
  weeklyGoal: number | null,
  currentWeekStart: Date,
): ConsistencyPeriod => {
  const weekEnd = endOfIsoWeek(weekStart);
  const trainedDays = countTrainedDays(dates, weekStart, weekEnd);

  return {
    startDate: formatDate(weekStart),
    endDate: formatDate(weekEnd),
    trainedDays,
    goal: weeklyGoal,
    remaining: calculateRemaining(trainedDays, weeklyGoal),
    completionPercentage: calculatePercentage(trainedDays, weeklyGoal),
    status: resolveWeekStatus(
      trainedDays,
      weeklyGoal,
      weekEnd,
      currentWeekStart,
    ),
  };
};

const buildMonthlyPeriod = (
  dates: Date[],
  monthStart: Date,
  monthlyGoal: number | null,
): MonthlyConsistency => {
  const monthEnd = endOfUtcMonth(monthStart);
  const trainedDays = countTrainedDays(dates, monthStart, monthEnd);

  return {
    startDate: formatDate(monthStart),
    endDate: formatDate(monthEnd),
    trainedDays,
    goal: monthlyGoal,
    remaining: calculateRemaining(trainedDays, monthlyGoal),
    completionPercentage: calculatePercentage(trainedDays, monthlyGoal),
  };
};

const buildHistory = (
  dates: Date[],
  firstWorkoutDate: Date | null,
  currentWeekStart: Date,
  weeklyGoal: number | null,
) => {
  const firstWeekStart = firstWorkoutDate
    ? startOfIsoWeek(firstWorkoutDate)
    : currentWeekStart;
  const history: ConsistencyHistoryItem[] = [];

  for (
    let cursor = firstWeekStart;
    cursor.getTime() <= currentWeekStart.getTime();
    cursor = new Date(cursor.getTime() + 7 * DAY_MS)
  ) {
    history.push(buildWeekPeriod(dates, cursor, weeklyGoal, currentWeekStart));
  }

  return history;
};

const calculateCompletedWeekStreak = (history: ConsistencyHistoryItem[]) => {
  let streak = 0;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];

    if (item.status === "in_progress") {
      continue;
    }

    if (item.status === "completed") {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
};

export const consistencyService = {
  async getConsistency(userId: string): Promise<ConsistencyResponse> {
    const now = new Date();
    const currentWeekStart = startOfIsoWeek(now);
    const currentWeekEnd = endOfIsoWeek(now);
    const currentMonthStart = startOfUtcMonth(now);
    const currentMonthEnd = endOfUtcMonth(now);
    const [goal, firstWorkout] = await Promise.all([
      goalRepository.findByUserId(userId),
      consistencyRepository.findFirstWorkoutDate(userId),
    ]);

    const firstRangeDate = firstWorkout
      ? startOfIsoWeek(firstWorkout.date)
      : currentWeekStart;
    const workoutDates = await consistencyRepository.findWorkoutDatesInRange({
      userId,
      fromDate: firstRangeDate,
      toDate: currentMonthEnd > currentWeekEnd ? currentMonthEnd : currentWeekEnd,
    });
    const dates = workoutDates.map((workout) => workout.date);
    const weeklyGoal = goal?.weeklyGoal ?? null;
    const monthlyGoal = goal?.monthlyGoal ?? null;
    const history = buildHistory(
      dates,
      firstWorkout?.date ?? null,
      currentWeekStart,
      weeklyGoal,
    );

    return {
      weekly: buildWeekPeriod(
        dates,
        currentWeekStart,
        weeklyGoal,
        currentWeekStart,
      ),
      monthly: buildMonthlyPeriod(dates, currentMonthStart, monthlyGoal),
      completedWeekStreak: calculateCompletedWeekStreak(history),
      history,
    };
  },
};

