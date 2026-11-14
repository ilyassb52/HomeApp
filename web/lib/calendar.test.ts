/* ==========================================================================
 * lib/calendar.test.ts — les tests des fonctions de calendrier
 *
 * Repères : le 1er novembre 2026 est un dimanche, le 1er février 2027 un
 * lundi.
 * ========================================================================== */

import { describe, expect, it } from "vitest";
import {
  addDays,
  dayLabel,
  longDayLabel,
  monthGrid,
  monthLabel,
  parisToday,
  shiftMonth,
} from "@/lib/calendar";

describe("parisToday", () => {
  it("donne le jour de Paris, pas celui de Londres", () => {
    /* 23 h 30 à Londres (UTC) = déjà 0 h 30 le lendemain à Paris. */
    expect(parisToday(new Date("2026-11-13T23:30:00Z"))).toBe("2026-11-14");
  });
});

describe("addDays", () => {
  it("passe d'un mois et d'une année à l'autre", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });

  it("ne saute pas de jour au passage à l'heure d'hiver", () => {
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
  });
});

describe("shiftMonth", () => {
  it("change d'année en décembre et en janvier", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});

describe("monthGrid", () => {
  it("commence un lundi et finit un dimanche", () => {
    const weeks = monthGrid(2026, 11);

    /* Le 1er est un dimanche : la grille commence le lundi 26 octobre. Le
     * 30 est un lundi : elle finit le dimanche 6 décembre. */
    expect(weeks).toHaveLength(6);
    expect(weeks[0][0]).toBe("2026-10-26");
    expect(weeks[0][6]).toBe("2026-11-01");
    expect(weeks[5][6]).toBe("2026-12-06");
  });

  it("tient en quatre semaines quand le mois s'y prête", () => {
    const weeks = monthGrid(2027, 2);

    expect(weeks).toHaveLength(4);
    expect(weeks[0][0]).toBe("2027-02-01");
    expect(weeks[3][6]).toBe("2027-02-28");
  });
});

describe("les jours en toutes lettres", () => {
  it("dit aujourd'hui, demain, puis le nom du jour", () => {
    expect(dayLabel("2026-11-13", "2026-11-13")).toBe("Aujourd'hui");
    expect(dayLabel("2026-11-14", "2026-11-13")).toBe("Demain");
    expect(dayLabel("2026-11-19", "2026-11-13")).toBe("Jeudi 19");
  });

  it("écrit le jour complet et le mois", () => {
    expect(longDayLabel("2026-11-19")).toBe("Jeudi 19 novembre");
    expect(monthLabel(2026, 11)).toBe("Novembre 2026");
  });
});
