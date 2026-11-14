/* ==========================================================================
 * app/app/shopping/page.tsx — la page téléphone « /app/shopping »
 *
 * Comme /app/priorities : ce fichier reste un composant serveur pour
 * déclarer le titre de l'onglet. Tout le reste vit dans ShoppingManager.
 * ========================================================================== */

import type { Metadata } from "next";
import ShoppingManager from "@/components/app/ShoppingManager";

export const metadata: Metadata = {
  title: "Courses",
};

export default function ShoppingPage() {
  return <ShoppingManager />;
}
