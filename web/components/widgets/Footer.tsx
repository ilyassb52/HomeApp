/* ==========================================================================
 * components/widgets/Footer.tsx — la ligne du bas de l'écran
 *
 * Deux textes, l'un à gauche, l'autre à droite, tous deux écrits dans
 * config/layouts.json sous les clés « left » et « right ». Rien n'est codé
 * ici : chaque mode a ses propres textes.
 *
 * LES DEUX JETONS DE REMPLACEMENT
 *
 * Certains textes du brief contiennent une partie qui change — l'heure de
 * mise à jour le matin, le prénom le soir. Les écrire en dur ferait mentir
 * l'écran, et les sortir de la configuration irait contre le principe du
 * projet. D'où deux mots-clés, remplacés au moment de l'affichage :
 *
 *   {heure}   → l'heure de rendu de l'écran, en heure de Paris
 *   {prenom}  → le prénom du profil actif, lu dans lib/mock.ts
 *
 * Exemple, dans layouts.json : "right": "Mis à jour à {heure}".
 * ========================================================================== */

"use client";

import { getActiveProfile } from "@/lib/mock";
import { readTextSetting } from "@/lib/settings";
import { formatParisTime } from "@/lib/time";

/** Remplace les jetons d'un texte de configuration par leurs valeurs. */
function fillPlaceholders(text: string, now: Date): string {
  return text
    .replaceAll("{heure}", formatParisTime(now))
    .replaceAll("{prenom}", getActiveProfile().name);
}

export default function Footer({
  settings,
}: {
  settings?: Record<string, unknown>;
}) {
  /* L'heure est lue à l'affichage. La page se redessinant chaque minute pour
   * vérifier le mode, « Mis à jour à » suit tout seul. */
  const now = new Date();

  const left = fillPlaceholders(readTextSetting(settings, "left", ""), now);
  const right = fillPlaceholders(readTextSetting(settings, "right", ""), now);

  /* Le fragment <>…</> laisse les deux textes être les enfants directs du
   * <footer> de WidgetRenderer, qui les écarte aux deux bords. Une boîte
   * intermédiaire casserait cet alignement. */
  return (
    <>
      <p className="text-[24px] font-light text-muted">{left}</p>
      <p className="text-[24px] font-light text-muted">{right}</p>
    </>
  );
}
