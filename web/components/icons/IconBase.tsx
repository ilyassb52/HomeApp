/* ==========================================================================
 * components/icons/IconBase.tsx — l'enveloppe commune à toutes les icônes
 *
 * Les vingt et une icônes du projet partagent exactement la même balise
 * <svg> : même zone de dessin, même épaisseur de trait, même traitement
 * d'accessibilité. Écrite une fois ici, elle n'est plus recopiée nulle part.
 * Chaque icône ne contient donc que son dessin.
 *
 * LA ZONE DE DESSIN
 *
 * viewBox="0 0 24 24" veut dire : « ce dessin est fait sur une grille de
 * 24 par 24 ». Les coordonnées des icônes sont donc toujours entre 0 et 24,
 * quelle que soit la taille d'affichage. La prop size (en pixels réels du
 * miroir) ne fait qu'agrandir le tout : dessiner une fois suffit.
 *
 * LES COULEURS
 *
 * Deux cas, et aucun n'écrit de code hexadécimal :
 *   - icône neutre (poubelle, train, livre…) : elle est dessinée en
 *     currentColor, c'est-à-dire la couleur du texte autour d'elle. Le widget
 *     décide avec une classe comme text-cyan ;
 *   - icône dont la couleur fait partie du sens (le soleil est ambre, la lune
 *     est crème) : elle nomme le jeton directement, var(--color-amber).
 *
 * L'ACCESSIBILITÉ
 *
 * aria-hidden="true" dit aux lecteurs d'écran d'ignorer l'icône. Ce n'est pas
 * de la négligence : l'information est toujours écrite en toutes lettres à
 * côté. Sans cela, un lecteur d'écran annoncerait un dessin sans nom.
 * ========================================================================== */

import type { ReactNode } from "react";
import { mp } from "@/lib/mirror-pixels";

/** Ce que reçoit toute icône du projet. */
export type IconProps = {
  /** Taille affichée, en pixels miroir (voir lib/mirror-pixels.ts). */
  size?: number;
  /** Classes de couleur ou de position, décidées par le widget. */
  className?: string;
};

/** Taille par défaut : lisible à deux mètres dans une carte. */
const DEFAULT_SIZE = 64;

export default function IconBase({
  size = DEFAULT_SIZE,
  className = "",
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      /* Dans style plutôt qu'en attributs width/height : un attribut SVG
       * n'accepte qu'un nombre, pas le calc() du pixel miroir.
       * flexShrink 0 : dans une colonne étroite, une boîte flex écraserait
       * l'icône pour faire de la place au texte. C'est au texte de passer
       * à la ligne, pas à l'icône de rétrécir. */
      style={{ width: mp(size), height: mp(size), flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      /* 1.6 sur une grille de 24 : assez épais pour se voir de loin à
       * travers un miroir sans tain, assez fin pour rester élégant. */
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}
