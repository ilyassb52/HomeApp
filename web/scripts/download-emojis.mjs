/* ==========================================================================
 * scripts/download-emojis.mjs — télécharge les émoticônes du catalogue
 *
 * Se lance depuis le dossier web/ avec :   npm run emojis
 *
 * Pour chaque ligne de lib/emojis.ts, il récupère l'animation chez Google et
 * l'enregistre dans public/emoji/<nom>.json. Les fichiers sont ensuite servis
 * par Next.js à l'adresse /emoji/<nom>.json : le miroir n'a plus besoin
 * d'Internet pour les afficher.
 *
 * Le format est Lottie : un fichier JSON qui DÉCRIT l'animation (formes,
 * mouvements, durée) au lieu de la contenir déjà dessinée. Le composant
 * Emoji la joue avec la bibliothèque lottie-web, ce qui permet de la mettre
 * en pause, de changer sa vitesse, etc.
 *
 * Relancer le script est sans danger : il réécrit simplement les fichiers.
 *
 * Note : lib/emojis.ts est un fichier TypeScript. La commande npm passe
 * l'option --experimental-strip-types à Node pour qu'il sache le lire.
 * ========================================================================== */

import { mkdir, writeFile } from "node:fs/promises";
import { EMOJIS } from "../lib/emojis.ts";

/* L'adresse d'une émoticône chez Google ; {code} est remplacé par son code. */
const SOURCE_URL =
  "https://fonts.gstatic.com/s/e/notoemoji/latest/{code}/lottie.json";

/* Le dossier de destination, calculé à partir de l'emplacement du script
 * pour fonctionner quel que soit le dossier d'où on le lance. */
const OUTPUT_DIR = new URL("../public/emoji/", import.meta.url);

/* -------------------------------------------------------------------------- */

async function downloadEmoji(name, code) {
  const response = await fetch(SOURCE_URL.replace("{code}", code));

  if (!response.ok) {
    throw new Error(
      `${response.status} — le code « ${code} » n'existe pas en version animée`,
    );
  }

  const animation = await response.text();
  await writeFile(new URL(`${name}.json`, OUTPUT_DIR), animation);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let failures = 0;

  for (const [name, code] of Object.entries(EMOJIS)) {
    try {
      await downloadEmoji(name, code);
      console.log(`  ✓ ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`  ✗ ${name} : ${error.message}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} émoticône(s) non téléchargée(s).`);
    process.exit(1);
  }

  console.log("\nToutes les émoticônes sont dans public/emoji/.");
}

main();
