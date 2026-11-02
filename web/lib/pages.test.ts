/* ==========================================================================
 * lib/pages.test.ts — les tests de findPageIndex
 * ========================================================================== */

import { describe, expect, it, vi } from "vitest";
import { findPageIndex } from "@/lib/pages";

const PAGE_IDS = ["morning", "evening"];

describe("findPageIndex", () => {
  it("affiche la première page sans paramètre", () => {
    expect(findPageIndex(PAGE_IDS, null)).toBe(0);
  });

  it("retrouve la page demandée", () => {
    expect(findPageIndex(PAGE_IDS, "evening")).toBe(1);
  });

  it("revient à la première page si le nom est inconnu, et le signale", () => {
    /* vi.spyOn remplace console.warn le temps du test : on vérifie que
     * l'avertissement part, sans polluer l'affichage des tests. */
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(findPageIndex(PAGE_IDS, "evenign")).toBe(0);
    expect(warn).toHaveBeenCalledOnce();

    warn.mockRestore();
  });
});
