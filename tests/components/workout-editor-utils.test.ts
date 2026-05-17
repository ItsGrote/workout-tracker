import { describe, expect, it } from "vitest";
import {
  createDefaultWorkoutFormDraft,
  createWorkoutFormDraftFromTemplate,
} from "@/components/dashboard/workout-editor-utils";
import type { CreateWorkoutInitialDraft } from "@/components/dashboard/types";

describe("workout editor utilities", () => {
  it("keeps manual workout creation defaults intact", () => {
    const draft = createDefaultWorkoutFormDraft();

    expect(draft).toMatchObject({
      category: "Chest",
      name: "Push A",
      exercises: [
        {
          name: "Bench Press",
          sets: [
            {
              repetitions: "10",
              setType: "working",
              weightKg: "40",
            },
          ],
        },
      ],
    });
  });

  it("fills a create-workout draft from a template with empty reps and weight", () => {
    const templateDraft: CreateWorkoutInitialDraft = {
      category: "Chest + Arms",
      name: "Chest + Arms",
      exercises: [
        {
          name: "Bench Press",
          sets: [
            { setType: "WORKING" },
            { setType: "WARM_UP" },
            { setType: "RECOGNITION_ACTIVATION" },
          ],
        },
      ],
    };

    const draft = createWorkoutFormDraftFromTemplate(templateDraft);

    expect(draft.name).toBe("Chest + Arms");
    expect(draft.category).toBe("Chest + Arms");
    expect(draft.exercises).toHaveLength(1);
    expect(draft.exercises[0]).toMatchObject({
      name: "Bench Press",
      sets: [
        { repetitions: "", setType: "working", weightKg: "" },
        { repetitions: "", setType: "warm-up", weightKg: "" },
        {
          repetitions: "",
          setType: "recognition-activation",
          weightKg: "",
        },
      ],
    });
  });
});
