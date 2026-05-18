import { describe, expect, it } from "vitest";
import {
  buildAnalyticsSearchParams,
  getSelectedOptions,
} from "@/components/progression/progression-analytics-state";

describe("progression analytics state helpers", () => {
  it("builds request params for a valid initial exercise selection", () => {
    const params = buildAnalyticsSearchParams({
      exerciseMetric: "volume",
      range: "30d",
      selectedValue: "Pulldown",
      target: "exercise",
      workoutFilter: "name",
    });

    expect(params.get("target")).toBe("exercise");
    expect(params.get("selectedValue")).toBe("Pulldown");
    expect(params.get("range")).toBe("30d");
    expect(params.get("exerciseMetric")).toBe("volume");
    expect(params.has("workoutFilter")).toBe(false);
  });

  it("builds request params for a valid saved workout/category preference", () => {
    const params = buildAnalyticsSearchParams({
      exerciseMetric: "max-weight",
      range: "90d",
      selectedValue: "Legs",
      target: "workout",
      workoutFilter: "category",
    });

    expect(params.get("target")).toBe("workout");
    expect(params.get("workoutFilter")).toBe("category");
    expect(params.get("selectedValue")).toBe("Legs");
  });

  it("does not send an invalid free selection when no target is selected", () => {
    const params = buildAnalyticsSearchParams({
      exerciseMetric: "volume",
      range: "30d",
      selectedValue: "",
      target: "",
      workoutFilter: "name",
    });

    expect(params.get("target")).toBeNull();
    expect(params.get("selectedValue")).toBeNull();
    expect(params.get("range")).toBe("30d");
  });

  it("resolves selected options by analytics type and workout filter", () => {
    const options = {
      exerciseNames: ["Pulldown"],
      workoutCategories: ["Back"],
      workoutNames: ["Pull A"],
    };

    expect(getSelectedOptions(options, "exercise", "name")).toEqual([
      "Pulldown",
    ]);
    expect(getSelectedOptions(options, "workout", "name")).toEqual(["Pull A"]);
    expect(getSelectedOptions(options, "workout", "category")).toEqual([
      "Back",
    ]);
    expect(getSelectedOptions(options, "", "name")).toEqual([]);
  });
});
