/* ==========================================================================
 * app/app/priorities/page.tsx — la page téléphone « /app/priorities »
 *
 * Le premier « app » est le dossier de l'App Router de Next.js ; le second
 * est le nôtre, qui regroupe les pages du téléphone (plan de développement).
 *
 * Ce fichier reste un composant serveur pour une seule raison : déclarer
 * le titre de l'onglet (metadata), ce qu'un composant client ne peut pas
 * faire. Tout le reste, interactif, vit dans PrioritiesManager.
 * ========================================================================== */

import type { Metadata } from "next";
import PrioritiesManager from "@/components/app/PrioritiesManager";

export const metadata: Metadata = {
  title: "Mes priorités",
};

export default function PrioritiesPage() {
  return <PrioritiesManager />;
}
