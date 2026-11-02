/* ==========================================================================
 * components/mirror/MirrorFrame.tsx — le cadre de l'écran
 *
 * UNE TOILE DE TAILLE FIXE, À L'ÉCHELLE DE L'ÉCRAN
 *
 * Chaque page est dessinée sur une toile de référence : 1080 × 1920 debout,
 * 1920 × 1080 couchée. Les widgets y sont posés à des positions exactes
 * (voir Place.tsx), calibrées une fois pour toutes.
 *
 * Pour que ces positions restent justes sur la tablette, sur un PC ou sur un
 * téléphone, la toile est agrandie ou réduite d'un bloc grâce au « pixel
 * miroir » --mp (app/globals.css) : la toile entière tient dans l'écran, et
 * elle est centrée. Rien ne défile, rien n'est coupé.
 *
 * LES TROIS CALQUES
 *
 *   1. la zone visible  — occupe la fenêtre, noire, ne bouge jamais
 *   2. le calque de fond — noir aujourd'hui, accueillera la vidéo d'arrière-plan
 *   3. le calque de contenu — la toile, centrée, avec les widgets
 *
 * Le fond est un calque séparé parce que le brief (section 4) annonce une
 * vidéo d'arrière-plan à une étape suivante : elle se glissera dans le
 * calque 2, sous les widgets.
 * ========================================================================== */

import type { ReactNode } from "react";

export default function MirrorFrame({
  calibrate = false,
  overlay,
  children,
}: {
  /** Affiche la grille et les coordonnées de chaque widget. */
  calibrate?: boolean;
  /** Ce qui flotte au-dessus de la toile, comme le bouton de page. */
  overlay?: ReactNode;
  children: ReactNode;
}) {
  return (
    /* Calque 1 — la zone visible.
     * fixed inset-0 = collé aux quatre bords de la fenêtre.
     * mirror-screen (globals.css) = pas de zoom, de curseur ni de sélection,
     * et c'est là que vit --mp, le pixel miroir. */
    <div className="mirror-screen fixed inset-0 bg-bg">
      {/* Calque 2 — le fond. Noir uni à cette étape ; la vidéo
          d'arrière-plan viendra ici, sous les widgets. */}
      <div className="absolute inset-0 bg-bg" />

      {/* Calque 3 — le contenu. La toile est centrée dans l'écran : si
          l'écran n'a pas tout à fait sa forme, il reste deux bandes noires,
          invisibles derrière le miroir.
          data-calibrate n'est posé qu'en mode calibrage : undefined fait
          disparaître l'attribut. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="mirror-canvas"
          data-calibrate={calibrate ? "" : undefined}
        >
          {children}
        </div>
      </div>

      {overlay}
    </div>
  );
}
