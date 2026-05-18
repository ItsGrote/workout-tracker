import { prisma } from "@/lib/prisma";

const includeVolumeTree = {
  exercises: {
    include: { sets: { orderBy: { order: "asc" as const } } },
    orderBy: { order: "asc" as const },
  },
};

type PreviousWorkoutLookup = {
  currentCreatedAt: Date;
  currentDate: Date;
  currentWorkoutId: string;
  userId: string;
};

const buildPreviousWorkoutWhere = ({
  currentCreatedAt,
  currentDate,
  currentWorkoutId,
}: PreviousWorkoutLookup) => ({
  AND: [
    { id: { not: currentWorkoutId } },
    {
      OR: [
        { date: { lt: currentDate } },
        {
          date: currentDate,
          createdAt: { lt: currentCreatedAt },
        },
        {
          date: currentDate,
          createdAt: currentCreatedAt,
          id: { lt: currentWorkoutId },
        },
      ],
    },
  ],
});

const previousWorkoutOrderBy = [
  { date: "desc" as const },
  { createdAt: "desc" as const },
  { id: "desc" as const },
];

export const workoutSummaryRepository = {
  findWorkoutById(id: string, userId: string) {
    return prisma.workout.findFirst({
      where: { id, userId },
      include: includeVolumeTree,
    });
  },

  findPreviousByCategory(
    lookup: PreviousWorkoutLookup & { category: string },
  ) {
    return prisma.workout.findFirst({
      where: {
        userId: lookup.userId,
        category: lookup.category,
        ...buildPreviousWorkoutWhere(lookup),
      },
      include: includeVolumeTree,
      orderBy: previousWorkoutOrderBy,
    });
  },

  findPreviousByName(lookup: PreviousWorkoutLookup & { name: string }) {
    return prisma.workout.findFirst({
      where: {
        userId: lookup.userId,
        name: lookup.name,
        ...buildPreviousWorkoutWhere(lookup),
      },
      include: includeVolumeTree,
      orderBy: previousWorkoutOrderBy,
    });
  },
};
