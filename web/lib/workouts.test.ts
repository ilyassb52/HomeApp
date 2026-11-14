/* ==========================================================================
 * lib/workouts.test.ts — les tests du rangement des séances
 *
 * Repères : le 1er novembre 2026 est un dimanche (premier lundi : le 2), le
 * 1er décembre 2026 un mardi (premier lundi : le 7). Février et mars 2027
 * commencent tous deux un lundi.
 * ========================================================================== */

import { describe, expect, it } from "vitest";
import type { Workout } from "@/lib/types";
import {
  defaultWeekIndex,
  exerciseSummary,
  countLabel,
  formatDuration,
  nextSetValues,
  setsLine,
  shortDayLabel,
  stepWeight,
  firstMonday,
  formatKg,
  groupByWeek,
  trainingMonthOf,
  trainingWeeks,
  weekLabel,
} from "@/lib/workouts";

/** Une séance minimale, le jour donné. */
function workout(id: number, day: string): Workout {
  return { id, day, note: null, exercises: [] };
}

/** Chaque semaine réduite à [début, fin] : plus lisible dans un expect. */
function bounds(year: number, month: number) {
  return trainingWeeks(year, month).map((w) => [w.start, w.end]);
}

describe("firstMonday", () => {
  it("trouve le premier lundi, même quand le 1er en est un", () => {
    expect(firstMonday(2026, 11)).toBe("2026-11-02"); // le 1er est un dimanche
    expect(firstMonday(2026, 12)).toBe("2026-12-07"); // le 1er est un mardi
    expect(firstMonday(2027, 2)).toBe("2027-02-01"); // le 1er est un lundi
  });
});

describe("trainingWeeks", () => {
  it("allonge la semaine 4 jusqu'au premier lundi du mois suivant", () => {
    expect(bounds(2026, 11)).toEqual([
      ["2026-11-02", "2026-11-08"],
      ["2026-11-09", "2026-11-15"],
      ["2026-11-16", "2026-11-22"],
      ["2026-11-23", "2026-12-06"],
    ]);
  });

  it("donne 4 semaines de 7 jours pile à février 2027", () => {
    expect(bounds(2027, 2)).toEqual([
      ["2027-02-01", "2027-02-07"],
      ["2027-02-08", "2027-02-14"],
      ["2027-02-15", "2027-02-21"],
      ["2027-02-22", "2027-02-28"],
    ]);
  });

  it("enchaîne les mois sans trou ni chevauchement", () => {
    const octobre = trainingWeeks(2026, 10);
    expect(octobre[3].end).toBe("2026-11-01");
    expect(trainingWeeks(2026, 11)[0].start).toBe("2026-11-02");
  });

  it("passe d'une année à l'autre en décembre", () => {
    /* Janvier 2027 commence un vendredi : premier lundi le 4. */
    expect(trainingWeeks(2026, 12)[3].end).toBe("2027-01-03");
  });
});

describe("trainingMonthOf", () => {
  it("range un jour d'avant le premier lundi dans le mois précédent", () => {
    expect(trainingMonthOf("2026-12-03")).toEqual({ year: 2026, month: 11 });
    expect(trainingMonthOf("2026-11-01")).toEqual({ year: 2026, month: 10 });
    expect(trainingMonthOf("2027-01-02")).toEqual({ year: 2026, month: 12 });
  });

  it("garde son mois à partir du premier lundi", () => {
    expect(trainingMonthOf("2026-12-07")).toEqual({ year: 2026, month: 12 });
    expect(trainingMonthOf("2026-11-14")).toEqual({ year: 2026, month: 11 });
  });
});

describe("groupByWeek", () => {
  it("range chaque séance dans sa semaine, hors mois ignorées", () => {
    const weeks = groupByWeek(2026, 11, [
      workout(1, "2026-11-01"), // semaine 4 d'octobre : ignorée
      workout(2, "2026-11-09"),
      workout(3, "2026-11-12"),
      workout(4, "2026-11-30"),
      workout(5, "2026-12-04"), // encore la semaine 4 de novembre
      workout(6, "2026-12-07"), // décembre
    ]);
    expect(weeks.map((w) => w.workouts.map((s) => s.id))).toEqual([
      [],
      [2, 3],
      [],
      [4, 5],
    ]);
  });
});

describe("weekLabel", () => {
  it("n'écrit le mois qu'une fois dans une semaine du même mois", () => {
    expect(weekLabel({ start: "2026-11-09", end: "2026-11-15" })).toBe(
      "9 – 15 nov.",
    );
  });

  it("écrit les deux mois quand la semaine 4 déborde sur le suivant", () => {
    expect(weekLabel({ start: "2026-11-23", end: "2026-12-06" })).toBe(
      "23 nov. – 6 déc.",
    );
  });
});

describe("exerciseSummary", () => {
  it("donne le poids le plus lourd", () => {
    const squat = {
      id: 1,
      name: "Squat",
      sets: [
        { reps: 10, weight_kg: 60 },
        { reps: 6, weight_kg: 82.5 },
        { reps: 8, weight_kg: 70 },
      ],
    };
    expect(exerciseSummary(squat)).toBe("3 séries · max 82,5 kg");
  });

  it("compte les répétitions au poids du corps", () => {
    const pompes = {
      id: 2,
      name: "Pompes",
      sets: [{ reps: 20, weight_kg: null }],
    };
    expect(exerciseSummary(pompes)).toBe("1 série · 20 reps");
  });
});

describe("formatKg", () => {
  it("écrit la virgule à la française", () => {
    expect(formatKg(62.5)).toBe("62,5 kg");
  });
});

describe("defaultWeekIndex", () => {
  const weeks = trainingWeeks(2026, 11);

  it("choisit la semaine qui contient le jour", () => {
    expect(defaultWeekIndex(weeks, "2026-11-14")).toBe(1); // S2
    expect(defaultWeekIndex(weeks, "2026-12-03")).toBe(3); // S4 allongée
  });

  it("revient à la première semaine pour un jour hors du mois", () => {
    expect(defaultWeekIndex(weeks, "2027-01-15")).toBe(0);
  });
});

describe("shortDayLabel", () => {
  it("écrit un jour court avec une majuscule", () => {
    expect(shortDayLabel("2026-11-09")).toBe("Lun. 9 nov.");
  });
});

describe("countLabel", () => {
  it("met le « s » au-delà de un, et le mot de zéro à zéro", () => {
    expect(countLabel("exo", 1, "Aucun exo")).toBe("1 exo");
    expect(countLabel("exo", 3, "Aucun exo")).toBe("3 exos");
    expect(countLabel("séance", 0, "Aucune séance")).toBe("Aucune séance");
  });
});

describe("nextSetValues", () => {
  const previous = [
    { reps: 8, weight_kg: 50 },
    { reps: 6, weight_kg: 55 },
  ];

  it("reprend la série d'avant de cet exercice", () => {
    expect(nextSetValues([{ reps: 10, weight_kg: 60 }], previous)).toEqual({
      reps: 10,
      kg: 60,
    });
  });

  it("sinon la première série de la dernière fois", () => {
    expect(nextSetValues([], previous)).toEqual({ reps: 8, kg: 50 });
  });

  it("sinon 10 reps au poids du corps", () => {
    expect(nextSetValues([], null)).toEqual({ reps: 10, kg: 0 });
    expect(nextSetValues([{ reps: 20, weight_kg: null }], null)).toEqual({
      reps: 20,
      kg: 0,
    });
  });
});

describe("stepWeight", () => {
  it("avance de 2,5 kg en restant sur les multiples", () => {
    expect(stepWeight(60, 1)).toBe(62.5);
    expect(stepWeight(60, -1)).toBe(57.5);
    expect(stepWeight(61, 1)).toBe(62.5);
    expect(stepWeight(61, -1)).toBe(60);
  });

  it("ne descend jamais sous 0", () => {
    expect(stepWeight(0, -1)).toBe(0);
    expect(stepWeight(1, -1)).toBe(0);
  });
});

describe("formatDuration", () => {
  it("écrit les minutes et les secondes", () => {
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(-3)).toBe("0:00");
  });
});

describe("setsLine", () => {
  it("résume les séries en court", () => {
    expect(
      setsLine([
        { reps: 8, weight_kg: 62.5 },
        { reps: 20, weight_kg: null },
      ]),
    ).toBe("8×62,5 · 20");
  });
});
