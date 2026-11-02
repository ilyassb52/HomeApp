/* ==========================================================================
 * Sun — météo « ensoleillé ». Les rayons tournent en 14 secondes, le disque
 * reste immobile. Couleur intrinsèque : ambre.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Sun({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      {/* Les huit rayons sont groupés dans un <g> : on anime le groupe, donc
          un seul mouvement pour les huit. icon-part leur donne leur propre
          centre de rotation — sans lui, ils tourneraient autour du coin du
          dessin et sortiraient de l'écran. */}
      <g className="icon-part animate-spin" stroke="var(--color-amber)">
        <path d="M12 1.6v2.8" />
        <path d="M12 19.6v2.8" />
        <path d="M1.6 12h2.8" />
        <path d="M19.6 12h2.8" />
        <path d="m4.7 4.7 2 2" />
        <path d="m17.3 17.3 2 2" />
        <path d="m19.3 4.7-2 2" />
        <path d="m6.7 17.3-2 2" />
      </g>
      <circle cx="12" cy="12" r="5" fill="var(--color-amber)" stroke="none" />
    </IconBase>
  );
}
