/* ==========================================================================
 * lib/modes.test.ts — les tests de getMode
 *
 * POURQUOI DES DATES EN UTC ET PAS « 5 h 59 »
 *
 * new Date("2026-01-05T05:59") construit cette heure DANS LE FUSEAU DE LA
 * MACHINE. Le test passerait chez toi et échouerait sur une autre machine —
 * ou pire, passerait pour une mauvaise raison.
 *
 * Le « Z » final de "2026-01-05T04:59:00Z" signifie « cette heure est en
 * UTC », le temps de référence mondial. C'est sans ambiguïté partout.
 * Il faut donc convertir à la main, et c'est là que le décalage compte :
 *
 *   hiver (heure d'hiver)  : Paris = UTC + 1h  →  5 h 59 Paris = 04:59 UTC
 *   été   (heure d'été)    : Paris = UTC + 2h  →  5 h 59 Paris = 03:59 UTC
 *
 * D'où les deux séries de tests : un bug qui ne se verrait qu'en été serait
 * découvert au mois de mars, sur le miroir, un dimanche matin.
 *
 * Dates utilisées (vérifiées) :
 *   lundi 5 janvier 2026    — semaine, heure d'hiver
 *   vendredi 9 janvier 2026 — pour la bascule vendredi soir / samedi
 *   samedi 10 janvier 2026  — week-end
 *   dimanche 11 janvier 2026
 *   lundi 6 juillet 2026    — semaine, heure d'été
 * ========================================================================== */

import { describe, expect, it } from "vitest";
import { getMode } from "@/lib/modes";

/** Raccourci de lecture : « à cet instant UTC, le mode vaut … ». */
function modeAt(utc: string) {
  return getMode(new Date(utc));
}

describe("getMode, en heure d'hiver (Paris = UTC+1)", () => {
  it("passe de la veille au matin à 6 h 00", () => {
    expect(modeAt("2026-01-05T04:59:00Z")).toBe("sleep"); // 5 h 59 Paris
    expect(modeAt("2026-01-05T05:00:00Z")).toBe("morning"); // 6 h 00 Paris
  });

  it("passe du matin au soir à 15 h 00", () => {
    expect(modeAt("2026-01-05T13:59:00Z")).toBe("morning"); // 14 h 59 Paris
    expect(modeAt("2026-01-05T14:00:00Z")).toBe("evening"); // 15 h 00 Paris
  });

  it("passe du soir à la veille à 23 h 00", () => {
    expect(modeAt("2026-01-05T21:59:00Z")).toBe("evening"); // 22 h 59 Paris
    expect(modeAt("2026-01-05T22:00:00Z")).toBe("sleep"); // 23 h 00 Paris
  });
});

describe("getMode, en heure d'été (Paris = UTC+2)", () => {
  it("passe de la veille au matin à 6 h 00", () => {
    expect(modeAt("2026-07-06T03:59:00Z")).toBe("sleep"); // 5 h 59 Paris
    expect(modeAt("2026-07-06T04:00:00Z")).toBe("morning"); // 6 h 00 Paris
  });

  it("passe du matin au soir à 15 h 00", () => {
    expect(modeAt("2026-07-06T12:59:00Z")).toBe("morning"); // 14 h 59 Paris
    expect(modeAt("2026-07-06T13:00:00Z")).toBe("evening"); // 15 h 00 Paris
  });

  it("passe du soir à la veille à 23 h 00", () => {
    expect(modeAt("2026-07-06T20:59:00Z")).toBe("evening"); // 22 h 59 Paris
    expect(modeAt("2026-07-06T21:00:00Z")).toBe("sleep"); // 23 h 00 Paris
  });
});

describe("getMode, le week-end", () => {
  it("affiche le week-end le samedi et le dimanche en journée", () => {
    expect(modeAt("2026-01-10T09:00:00Z")).toBe("weekend"); // samedi 10 h
    expect(modeAt("2026-01-11T09:00:00Z")).toBe("weekend"); // dimanche 10 h
  });

  it("garde le mode week-end l'après-midi, sans passer au soir", () => {
    /* La bascule de 15 h ne concerne que la semaine : un samedi à 16 h
     * reste en mode week-end. */
    expect(modeAt("2026-01-10T15:00:00Z")).toBe("weekend"); // samedi 16 h
  });

  it("enchaîne le vendredi soir, la nuit, puis le samedi", () => {
    expect(modeAt("2026-01-09T21:59:00Z")).toBe("evening"); // vendredi 22 h 59
    expect(modeAt("2026-01-09T22:00:00Z")).toBe("sleep"); // vendredi 23 h 00
    expect(modeAt("2026-01-10T04:59:00Z")).toBe("sleep"); // samedi 5 h 59
    expect(modeAt("2026-01-10T05:00:00Z")).toBe("weekend"); // samedi 6 h 00
  });

  it("met la veille au-dessus du week-end", () => {
    /* L'ordre des conditions compte : un samedi à minuit doit être en
     * veille, pas en week-end. */
    expect(modeAt("2026-01-09T23:00:00Z")).toBe("sleep"); // samedi 0 h 00
  });
});
