/* ==========================================================================
 * lib/emojis.ts — le catalogue des émoticônes animées du projet
 *
 * Toutes les images du miroir viennent des émoticônes animées de Google :
 *   https://googlefonts.github.io/noto-emoji-animation
 *
 * Chaque ligne associe un NOM, choisi par nous et utilisé dans le code
 * (<Emoji name="sun" />), à un CODE, celui de Google. Le code se trouve sur le
 * site ci-dessus : cliquer une émoticône, il s'affiche sous la forme
 * « 1f31e » (les mots séparés par « _ » font partie du code).
 *
 * AJOUTER OU CHANGER UNE ÉMOTICÔNE
 *
 *   1. modifier ou ajouter une ligne ci-dessous ;
 *   2. dans le dossier web/, lancer :  npm run emojis
 *      Le script télécharge les animations dans public/emoji/<nom>.json.
 *
 * Toutes les émoticônes n'existent pas en version animée (pas de soleil
 * simple, pas de mallette…). Dans ce cas le script affiche une erreur : il
 * faut choisir une autre émoticône sur le site.
 *
 * Ce fichier est aussi lu par le script de téléchargement, qui tourne hors de
 * Next.js : il ne doit donc rien importer.
 * ========================================================================== */

export const EMOJIS = {
  /* --- Météo ----------------------------------------------------------- */
  sun: "1f31e", //              🌞 ensoleillé
  sunCloud: "26c5", //          ⛅ nuageux
  rainCloud: "1f327_fe0f", //   🌧️ pluie
  moon: "1f31b", //             🌛 nuit

  /* --- Alertes --------------------------------------------------------- */
  umbrella: "2602_fe0f", //     ☂️ il va pleuvoir
  trash: "1f5d1_fe0f", //       🗑️ sortir les poubelles

  /* --- Habitudes ------------------------------------------------------- */
  flame: "1f525", //            🔥 série de sport
  books: "1f4da", //            📚 lecture
  droplet: "1f4a7", //          💧 eau bue

  /* --- Catégories de priorités ----------------------------------------- */
  policeLight: "1f6a8", //      🚨 tâche
  rocket: "1f680", //           🚀 projet
  muscle: "1f4aa", //           💪 sport

  /* --- Autres widgets -------------------------------------------------- */
  smiley: "1f60a", //           😊 salutation du matin
  cooking: "1f373", //          🍳 menu du soir
  sparkles: "2728", //          ✨ bilan de la journée
  heart: "2764_fe0f", //        ❤️ petit message
  sunRise: "1f305"
} as const;

/** Le nom d'une émoticône du catalogue : "sun", "moon", "heart"… */
export type EmojiName = keyof typeof EMOJIS;
