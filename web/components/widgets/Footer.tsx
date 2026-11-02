/* ==========================================================================
 * components/widgets/Footer.tsx — la ligne du bas de l'écran
 *
 * Deux textes, l'un à gauche, l'autre à droite, donnés par la page dans les
 * props « left » et « right ». Rien n'est codé ici : chaque page a ses
 * propres textes.
 *
 * LES DEUX JETONS DE REMPLACEMENT
 *
 * Certains textes du brief contiennent une partie qui change — l'heure de
 * mise à jour le matin, le prénom le soir. Les écrire en dur ferait mentir
 * l'écran. D'où deux mots-clés, remplacés au moment de l'affichage :
 *
 *   {heure}   → l'heure de rendu de l'écran, en heure de Paris
 *   {prenom}  → le prénom du profil actif, lu dans lib/mock.ts
 *
 * Exemple, dans une page : <Footer right="Mis à jour à {heure}" />.
 * ========================================================================== */

"use client";

import { getActiveProfile } from "@/lib/mock";
import { formatParisTime } from "@/lib/time";

/** Remplace les jetons d'un texte par leurs valeurs. */
function fillPlaceholders(text: string, now: Date): string {
  return text
    .replaceAll("{heure}", formatParisTime(now))
    .replaceAll("{prenom}", getActiveProfile().name);
}

export default function Footer({
  left = "",
  right = "",
}: {
  left?: string;
  right?: string;
}) {
  /* L'heure est lue à l'affichage : « Mis à jour à » donne donc l'heure à
   * laquelle la page a été dessinée. */
  const now = new Date();

  /* justify-between écarte les deux textes aux deux bords. La largeur de la
   * ligne, elle, est fixée par la page (prop w de <Place>). */
  return (
    <div className="flex items-end justify-between gap-mp-36">
      <p className="text-mp-24 font-light text-muted">
        {fillPlaceholders(left, now)}
      </p>
      <p className="text-mp-24 font-light text-muted">
        {fillPlaceholders(right, now)}
      </p>
    </div>
  );
}
