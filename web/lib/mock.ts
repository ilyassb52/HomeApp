/* ==========================================================================
 * lib/mock.ts — toutes les données fictives du miroir
 *
 * POURQUOI UN SEUL FICHIER POUR TOUTES LES DONNÉES
 *
 * Chaque widget va chercher ses données ici, et nulle part ailleurs. À
 * l'étape 3 du projet, ce fichier sera remplacé par des appels à l'API : il
 * y aura donc UN endroit à débrancher, et les widgets ne bougeront pas.
 *
 * C'est aussi pour cela que les formes sont décrites dans lib/types.ts et
 * pas ici : les mêmes types décriront les réponses de l'API.
 *
 * Les valeurs sont réalistes et en français, comme le demande le brief : un
 * écran rempli de « Lorem ipsum » ne permet pas de juger si les textes
 * tiennent dans les cartes.
 * ========================================================================== */

import type { Profile, Weather } from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Le foyer
 *
 * Aucun prénom n'est écrit en dur dans un composant (section 10 du brief) :
 * tout part d'ici. Remplacer « Profil 2 » et « Profil 3 » par les vrais
 * prénoms ne demande donc de toucher qu'à ce fichier.
 * -------------------------------------------------------------------------- */
export const mockProfiles: Profile[] = [
  { id: "p1", name: "Ilyass" },
  { id: "p2", name: "Profil 2" },
  { id: "p3", name: "Profil 3" },
];

/** Celui à qui l'écran s'adresse. L'appli téléphone le changera plus tard. */
export const mockActiveProfileId = "p1";

/** Raccourci : le profil actif, ou le premier si l'identifiant est inconnu. */
export function getActiveProfile(): Profile {
  return (
    mockProfiles.find((profile) => profile.id === mockActiveProfileId) ??
    mockProfiles[0]
  );
}

/* --------------------------------------------------------------------------
 * 2. La météo
 * -------------------------------------------------------------------------- */
export const mockWeather: Weather = {
  condition: "cloudy",
  temperature: 12,
  minTemperature: 8,
  maxTemperature: 15,
  label: "Nuageux",
};
