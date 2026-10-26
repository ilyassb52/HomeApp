/* ==========================================================================
 * lib/types.ts — le vocabulaire partagé du projet
 *
 * Un type TypeScript n'existe qu'au moment où tu écris le code : il ne produit
 * aucune ligne dans le site final. Son seul rôle est de t'empêcher d'écrire
 * une bêtise — un mode qui n'existe pas, une zone mal orthographiée — et de
 * te proposer les bonnes valeurs pendant la frappe.
 *
 * Ce fichier est l'endroit unique où ces mots sont définis. Tout le reste du
 * projet les importe d'ici, jamais ne les redéfinit.
 * ========================================================================== */

/* --------------------------------------------------------------------------
 * 1. Les modes de l'écran
 *
 * Le « | » se lit « ou » : un Mode est l'une de ces quatre valeurs, et aucune
 * autre. Écrire "mornng" quelque part devient une erreur signalée tout de
 * suite, au lieu d'un écran vide un matin à 7 h.
 *
 * Le mode sleep est à part : c'est l'écran de veille, il n'a pas de
 * disposition de widgets (voir Layout plus bas).
 * -------------------------------------------------------------------------- */
export type Mode = "morning" | "evening" | "weekend" | "sleep";

/* --------------------------------------------------------------------------
 * 2. Les types de widgets
 *
 * La liste complète de ce que l'écran saura afficher à la fin de l'étape 1.
 * Aujourd'hui, un seul est réellement écrit (clock) : les autres sont déjà
 * nommés ici pour que config/layouts.json puisse être rempli en entier, et
 * que les tâches 6 à 8 n'aient plus qu'à brancher les composants.
 * -------------------------------------------------------------------------- */
export type WidgetType =
  | "clock"
  | "weather"
  | "weatherTomorrow"
  | "weatherWeekend"
  | "alert"
  | "greeting"
  | "priorities"
  | "transport"
  | "habits"
  | "dailyReview"
  | "agenda"
  | "menu"
  | "message"
  | "weekendBanner"
  | "shopping"
  | "chores"
  | "weekendEvents"
  | "photo"
  | "footer";

/* --------------------------------------------------------------------------
 * 3. Les quatre zones de l'écran
 *
 *   ┌─────────────────────────────────┐
 *   │ header-left      header-right   │  heure et date │ météo
 *   ├─────────────────────────────────┤
 *   │ main                            │  empilement vertical,
 *   │   (dans l'ordre de la config)   │  dans l'ordre du tableau
 *   ├─────────────────────────────────┤
 *   │ footer                          │  collé en bas
 *   └─────────────────────────────────┘
 * -------------------------------------------------------------------------- */
export type WidgetArea = "header-left" | "header-right" | "main" | "footer";

/* --------------------------------------------------------------------------
 * 4. Une entrée de configuration
 *
 * C'est la description d'UN widget posé sur l'écran. Elle ne contient aucune
 * donnée affichée : seulement quoi afficher, où, et avec quels réglages.
 * Les données, elles, chaque widget va les chercher lui-même.
 * -------------------------------------------------------------------------- */
export interface WidgetConfig {
  /** Unique dans une disposition, ex. « weather-1 ». Sert de clé à React. */
  id: string;
  type: WidgetType;
  area: WidgetArea;
  /* Réglages propres au widget (max: 3, showMoon: true…).
   * Record<string, unknown> se lit : « des clés texte, dont on ne connaît pas
   * encore le contenu ». Chaque widget lira les siennes et leur donnera un
   * type au passage. Le « ? » rend le champ facultatif. */
  settings?: Record<string, unknown>;
}

/* --------------------------------------------------------------------------
 * 5. Une disposition complète, pour un mode
 *
 * Exclude<Mode, "sleep"> signifie « un Mode, sauf sleep » : la veille n'affiche
 * pas de widgets, elle n'a donc pas de disposition. Le dire dans le type évite
 * d'avoir à l'expliquer dans un commentaire à chaque usage.
 * -------------------------------------------------------------------------- */
export interface Layout {
  mode: Exclude<Mode, "sleep">;
  /** L'ordre du tableau est l'ordre d'affichage à l'écran. */
  widgets: WidgetConfig[];
}
