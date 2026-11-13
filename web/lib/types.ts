/* ==========================================================================
 * lib/types.ts — le vocabulaire partagé du projet
 *
 * Un type TypeScript n'existe qu'au moment où tu écris le code : il ne produit
 * aucune ligne dans le site final. Son seul rôle est de t'empêcher d'écrire
 * une bêtise — une couleur inconnue, une météo mal orthographiée — et de
 * te proposer les bonnes valeurs pendant la frappe.
 *
 * Ce fichier est l'endroit unique où ces mots sont définis. Tout le reste du
 * projet les importe d'ici, jamais ne les redéfinit.
 * ========================================================================== */

import type { components } from "@/lib/api/schema";

/* --------------------------------------------------------------------------
 * 1. Les couleurs de thème
 *
 * Les cinq couleurs néon de la section 4, celles qu'un élément peut prendre :
 * une carte, une pastille d'agenda, une icône de catégorie.
 *
 * Ce type vivait dans components/ui/Card.tsx tant que la carte était seule à
 * s'en servir. Les widgets et les profils en ont maintenant besoin : il
 * déménage ici, comme annoncé. C'est la règle de la section 10 — factoriser
 * à la deuxième occurrence, pas avant.
 * -------------------------------------------------------------------------- */
export type Tone = "amber" | "cyan" | "magenta" | "neon-green" | "coral";

/* --------------------------------------------------------------------------
 * 2. La forme des données
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
}

/** Une priorité, telle que l'API la renvoie (GoalRead, api/app/schemas/goal.py).
 *  Ce type n'est pas écrit à la main : il vient de lib/api/schema.d.ts, généré
 *  depuis l'API. Si l'API change, TypeScript le signale ici. */
export type Priority = components["schemas"]["GoalRead"];

/** Les trois domaines d'une priorité, chacun avec sa couleur et son icône. */
export type PriorityCategory = Priority["category"];
