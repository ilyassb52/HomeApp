/* ==========================================================================
 * components/mirror/pages/index.ts — la liste des pages du miroir
 *
 * L'ordre du tableau est l'ordre du bouton « page suivante ». Ajouter une
 * page = créer son fichier dans ce dossier et ajouter UNE ligne ci-dessous.
 *
 * id     : le nom dans l'URL, /mirror?page=evening
 * label  : le nom affiché sur le bouton
 * ========================================================================== */

import type { ComponentType } from "react";
import EveningPage from "@/components/mirror/pages/EveningPage";
import MorningPage from "@/components/mirror/pages/MorningPage";

export type MirrorPage = {
  id: string;
  label: string;
  Component: ComponentType;
};

export const MIRROR_PAGES: readonly MirrorPage[] = [
  { id: "morning", label: "Matin", Component: MorningPage },
  { id: "evening", label: "Soir", Component: EveningPage },
];
