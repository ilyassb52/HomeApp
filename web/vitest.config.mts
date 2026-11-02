/* ==========================================================================
 * vitest.config.ts — la configuration des tests
 *
 * Vitest exécute les fichiers *.test.ts et compare le résultat obtenu au
 * résultat attendu. Il vérifie les règles de calcul du projet, comme
 * findPageIndex (lib/pages.ts).
 * ========================================================================== */

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/* Le dossier qui contient ce fichier, calculé proprement sous Windows comme
 * sous Linux. C'est la racine du projet web/. */
const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    /* Le même raccourci que dans tsconfig.json : « @/lib/pages » désigne
     * web/lib/pages. Sans cette ligne, Vitest ne saurait pas le résoudre. */
    alias: { "@": rootDirectory },
  },
  test: {
    /* environment "node" : pas de navigateur simulé. Les fonctions testées
     * sont pures, elles n'ont besoin d'aucune page. Les tests démarrent
     * donc en une fraction de seconde. */
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
