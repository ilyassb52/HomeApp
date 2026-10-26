/* ==========================================================================
 * components/ui/SectionLabel.tsx — le petit titre au-dessus d'une liste
 *
 * « MES 3 PRIORITÉS », « MES SÉRIES », « DEMAIN », « COURSES DU FOYER »…
 * Ce sont tous le même objet visuel, décrit une seule fois ici :
 * 22 px, majuscules, espacement de 3 px entre les lettres, graisse 600,
 * couleur « label » (section 4 du brief).
 *
 * C'est l'exemple le plus simple de factorisation : ce titre revient dans six
 * widgets. S'il était écrit six fois, changer sa taille demanderait six
 * modifications — et on en oublierait une.
 * ========================================================================== */

import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
  /* className permet à un widget d'ajuster seulement sa POSITION (une marge,
   * par exemple) sans réécrire l'apparence du titre. L'apparence, elle, reste
   * décidée ici et nulle part ailleurs.
   * Le « ? » signifie que cette propriété est optionnelle. */
  className?: string;
};

export default function SectionLabel({
  children,
  className = "",
}: SectionLabelProps) {
  return (
    <p
      className={`text-[22px] font-semibold tracking-[3px] text-label uppercase ${className}`}
    >
      {children}
    </p>
  );
}
