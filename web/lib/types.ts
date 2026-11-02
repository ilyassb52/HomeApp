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

import type { components } from "@/lib/api/schema";

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

/* --------------------------------------------------------------------------
 * 6. Les couleurs de thème
 *
 * Les cinq couleurs néon de la section 4, celles qu'un élément peut prendre :
 * une carte, une pastille de profil, une icône de catégorie.
 *
 * Ce type vivait dans components/ui/Card.tsx tant que la carte était seule à
 * s'en servir. Les widgets et les profils en ont maintenant besoin : il
 * déménage ici, comme annoncé. C'est la règle de la section 10 — factoriser
 * à la deuxième occurrence, pas avant.
 * -------------------------------------------------------------------------- */
export type Tone = "amber" | "cyan" | "magenta" | "neon-green" | "coral";

/* --------------------------------------------------------------------------
 * 7. La forme des données
 *
 * ATTENTION, CES FORMES COMPTENT PLUS QU'IL N'Y PARAÎT.
 *
 * Aujourd'hui elles décrivent les données fictives de lib/mock.ts. À l'étape
 * 3 du projet, elles deviendront les réponses de la vraie API. Un widget
 * écrit contre ces formes n'aura alors rien à changer : seule la source
 * changera. D'où la consigne du brief — les garder simples et plates.
 * -------------------------------------------------------------------------- */

/** Les quatre temps que le miroir sait dessiner (section 10). */
export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "night";

export interface Weather {
  condition: WeatherCondition;
  /** En degrés Celsius, arrondis. */
  temperature: number;
  minTemperature: number;
  maxTemperature: number;
  /** Le temps en toutes lettres, affiché tel quel : « Nuageux ». */
  label: string;
}

/** Un membre du foyer. Les vrais prénoms se changent dans lib/mock.ts. */
export interface Profile {
  id: string;
  name: string;
  tone: Tone;
}

/** Les deux alertes du matin et du soir (section 6). */
export type AlertKind = "rain" | "trash";

export interface Alert {
  kind: AlertKind;
  title: string;
  /** Le conseil qui suit le titre : « Prends un parapluie ». */
  advice: string;
}

/** Une priorité, telle que l'API la renvoie (GoalRead, api/app/schemas/goal.py).
 *  Ce type n'est pas écrit à la main : il vient de lib/api/schema.d.ts, généré
 *  depuis l'API. Si l'API change, TypeScript le signale ici. */
export type Priority = components["schemas"]["GoalRead"];

/** Les trois domaines d'une priorité, chacun avec sa couleur et son icône. */
export type PriorityCategory = Priority["category"];

export interface Transport {
  /** Le numéro ou le nom de la ligne, affiché dans une pastille. */
  line: string;
  direction: string;
  /** « Pars dans 4 min », calculé plus tard par l'API. */
  advice: string;
  /** Les deux prochains passages, le premier étant le plus proche. */
  departures: string[];
}

/** Les trois séries suivies le matin (section 6). */
export type HabitKind = "sport" | "reading" | "water";

export interface Habit {
  id: string;
  kind: HabitKind;
  /** La valeur mise en avant : « 12 jours », « 1,5 L ». */
  value: string;
  label: string;
}

/** Un rendez-vous du lendemain, affiché le soir. */
export interface AgendaEvent {
  id: string;
  /** Déjà mis en forme : « 09:00 ». L'écran ne recalcule rien. */
  time: string;
  title: string;
  /** La couleur de la pastille, pour distinguer les domaines d'un coup d'œil. */
  tone: Tone;
}

export interface Menu {
  /** Le plat prévu : « Gratin de courgettes ». */
  dish: string;
  /** Le rappel de préparation, facultatif : « Sortir la viande ce soir ». */
  reminder?: string;
}

/** Le mot laissé par un membre du foyer sur l'écran du soir. */
export interface Message {
  /** L'identifiant d'un profil de lib/mock.ts : le nom en est déduit. */
  fromProfileId: string;
  text: string;
}
