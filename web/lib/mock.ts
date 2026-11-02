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

import type {
  AgendaEvent,
  Alert,
  Habit,
  Menu,
  Message,
  Profile,
  Transport,
  Weather,
} from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Le foyer
 *
 * Aucun prénom n'est écrit en dur dans un composant (section 10 du brief) :
 * tout part d'ici. Remplacer « Profil 2 » et « Profil 3 » par les vrais
 * prénoms ne demande donc de toucher qu'à ce fichier.
 * -------------------------------------------------------------------------- */
export const mockProfiles: Profile[] = [
  { id: "p1", name: "Ilyass", tone: "cyan" },
  { id: "p2", name: "Profil 2", tone: "magenta" },
  { id: "p3", name: "Profil 3", tone: "neon-green" },
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

/** La météo du lendemain, affichée le soir. */
export const mockWeatherTomorrow: Weather = {
  condition: "rainy",
  temperature: 9,
  minTemperature: 6,
  maxTemperature: 11,
  label: "Pluie",
};

/* --------------------------------------------------------------------------
 * 3. Les alertes
 *
 * Le miroir n'affiche qu'une alerte à la fois, et laquelle dépend du moment :
 * la pluie le matin, les poubelles le soir. C'est la page qui choisit, par
 * la prop « kind » du widget Alert.
 *
 * Pourquoi la page plutôt que le widget ? Parce que le widget ne sait pas
 * sur quelle page il est, et ne doit pas le savoir : il affiche ce qu'on lui
 * demande. C'est le même principe que partout ailleurs dans le projet.
 *
 * Vider ce tableau est le moyen le plus simple de vérifier qu'une alerte
 * absente ne laisse aucun trou dans la pile (section 10).
 * -------------------------------------------------------------------------- */
export const mockAlerts: Alert[] = [
  {
    kind: "rain",
    title: "Pluie cet après-midi",
    advice: "Prends un parapluie en partant",
  },
  {
    kind: "trash",
    title: "Poubelles jaunes demain",
    advice: "À sortir avant 20 h ce soir",
  },
];

/* --------------------------------------------------------------------------
 * 4. Les priorités du jour
 *
 * Premières données débranchées : elles viennent maintenant de l'API (voir
 * lib/api/priorities.ts). Les exemples d'ici sont passés dans le seed de
 * la base, api/app/seed.py.
 * -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
 * 5. Les transports
 * -------------------------------------------------------------------------- */
export const mockTransport: Transport = {
  line: "RER B",
  direction: "Direction Châtelet",
  advice: "Pars dans 4 min",
  departures: ["07:42", "07:54"],
};

/* --------------------------------------------------------------------------
 * 6. Les séries d'habitudes
 * -------------------------------------------------------------------------- */
export const mockHabits: Habit[] = [
  { id: "h1", kind: "sport", value: "12 jours", label: "Sport" },
  { id: "h2", kind: "reading", value: "5 jours", label: "Lecture" },
  { id: "h3", kind: "water", value: "1,5 L", label: "Eau hier" },
];

/* --------------------------------------------------------------------------
 * 7. L'agenda du lendemain
 * -------------------------------------------------------------------------- */
export const mockAgenda: AgendaEvent[] = [
  { id: "a1", time: "09:00", title: "Point d'équipe", tone: "cyan" },
  { id: "a2", time: "12:30", title: "Déjeuner avec Sarah", tone: "coral" },
  { id: "a3", time: "16:00", title: "Cours d'anglais", tone: "magenta" },
  { id: "a4", time: "18:30", title: "Séance de sport", tone: "neon-green" },
  /* Le cinquième est volontairement là : le réglage « max » du widget est à
   * 4, il permet de vérifier que la coupe fonctionne. */
  { id: "a5", time: "20:00", title: "Appel famille", tone: "amber" },
];

/* --------------------------------------------------------------------------
 * 8. Le menu du lendemain
 * -------------------------------------------------------------------------- */
export const mockMenu: Menu = {
  dish: "Gratin de courgettes",
  reminder: "Sortir le fromage ce soir",
};

/* --------------------------------------------------------------------------
 * 9. Le mot du soir
 *
 * Comme l'alerte, il peut être absent : mettre null ici vérifie que le widget
 * disparaît sans laisser d'espace.
 * -------------------------------------------------------------------------- */
export const mockMessage: Message | null = {
  fromProfileId: "p2",
  text: "Pense à arroser les plantes, je rentre tard demain",
};

/** Le nom d'un profil à partir de son identifiant, pour « MOT DE … ». */
export function getProfileName(profileId: string): string {
  return (
    mockProfiles.find((profile) => profile.id === profileId)?.name ?? "Inconnu"
  );
}
