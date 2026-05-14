import { prisma } from "@/lib/prisma";
import type { ExerciseSetType, Prisma } from "@prisma/client";

export type CreateWorkoutData = {
  userId: string;
  name: string;
  category?: string | null;
  date: Date;
};

export type CreateWorkoutSetData = {
  repetitions: number;
  weightKg: Prisma.Decimal | number | string;
  setType: ExerciseSetType;
  order: number;
};

export type CreateWorkoutExerciseData = {
  name: string;
  order: number;
  sets: CreateWorkoutSetData[];
};

export type CreateWorkoutWithExercisesData = CreateWorkoutData & {
  exercises: CreateWorkoutExerciseData[];
};

export type UpdateWorkoutData = Partial<
  Pick<CreateWorkoutData, "name" | "category" | "date">
>;

export type UpdateWorkoutWithExercisesData = UpdateWorkoutData & {
  exercises?: CreateWorkoutExerciseData[];
};

export type WorkoutQueryFilters = {
  userId: string;
  category?: string;
  fromDate?: Date;
  toDate?: Date;
  exerciseName?: string;
  search?: string;
};

export const workoutRepository = {
  create(data: CreateWorkoutData) {
    return prisma.workout.create({ data });
  },

  createWithExercises(data: CreateWorkoutWithExercisesData) {
    return prisma.workout.create({
      data: {
        userId: data.userId,
        name: data.name,
        category: data.category,
        date: data.date,
        exercises: {
          create: data.exercises.map((exercise) => ({
            name: exercise.name,
            order: exercise.order,
            sets: {
              create: exercise.sets,
            },
          })),
        },
      },
      include: {
        exercises: {
          include: { sets: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });
  },

  findById(id: string, userId: string) {
    return prisma.workout.findFirst({
      where: { id, userId },
      include: {
        exercises: {
          include: { sets: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });
  },

  findMany(filters: WorkoutQueryFilters) {
    return prisma.workout.findMany({
      where: {
        userId: filters.userId,
        category: filters.category,
        name: filters.search
          ? { contains: filters.search, mode: "insensitive" }
          : undefined,
        date: {
          gte: filters.fromDate,
          lte: filters.toDate,
        },
        exercises: filters.exerciseName
          ? {
              some: {
                name: { contains: filters.exerciseName, mode: "insensitive" },
              },
            }
          : undefined,
      },
      include: {
        exercises: {
          include: { sets: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  update(id: string, userId: string, data: UpdateWorkoutData) {
    return prisma.workout.update({
      where: { id, userId },
      data,
    });
  },

  updateWithExercises(
    id: string,
    userId: string,
    data: UpdateWorkoutWithExercisesData,
  ) {
    return prisma.$transaction(async (tx) => {
      const workout = await tx.workout.findFirst({
        where: { id, userId },
        select: { id: true },
      });

      if (!workout) {
        return null;
      }

      if (data.exercises) {
        await tx.exercise.deleteMany({ where: { workoutId: id } });
      }

      return tx.workout.update({
        where: { id },
        data: {
          name: data.name,
          category: data.category,
          date: data.date,
          exercises: data.exercises
            ? {
                create: data.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: {
                    create: exercise.sets,
                  },
                })),
              }
            : undefined,
        },
        include: {
          exercises: {
            include: { sets: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
        },
      });
    });
  },

  delete(id: string, userId: string) {
    return prisma.workout.deleteMany({
      where: { id, userId },
    });
  },
};
