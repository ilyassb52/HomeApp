/* ==========================================================================
 * lib/api/client.ts — le client qui parle à l'API FastAPI
 *
 * openapi-fetch s'appuie sur schema.d.ts, que « npm run api:types » génère à
 * partir de l'API elle-même. TypeScript connaît donc chaque route, ses
 * paramètres et sa réponse : une faute dans « /goals » ou un champ oublié
 * est signalée avant même de lancer l'application.
 *
 * Quand l'API change, relancer « npm run api:types » (API démarrée).
 * ========================================================================== */

import createClient from "openapi-fetch";
import type { paths } from "@/lib/api/schema";

/* « /backend » est relayé vers FastAPI par next.config.ts. */
export const api = createClient<paths>({ baseUrl: "/backend" });

/* PROVISOIRE, EN ATTENDANT L'AUTHENTIFICATION (étape 3).
 *
 * Le miroir affiche les priorités d'un seul profil : le 1, Ilyass dans le
 * seed (api/app/seed.py). Comme dans api/app/core/auth.py, cette constante
 * disparaîtra avec le JWT : le profil viendra du jeton. */
export const MIRROR_PROFILE_ID = 1;
