/* ==========================================================================
 * RainCloud — météo « pluie ». Le nuage dérive, trois gouttes tombent en
 * décalé pour que la pluie paraisse continue plutôt que rythmée.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

/* Le décalage de départ de chaque goutte. Les trois partagent la même
 * animation de 1,4 s ; ces retards les désynchronisent, comme l'indique le
 * brief (« décalages de 0,5 s entre gouttes »). */
const DROP_DELAYS = ["0s", "0.5s", "1s"];

/* Position horizontale de chaque goutte, sur la grille de 24. */
const DROP_POSITIONS = [9, 12.5, 16];

export default function RainCloud({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <path
        className="icon-part animate-drift"
        d="M7.2 15.5h10a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.5-.8 3.4 3.4 0 0 0-.8 7.8Z"
        stroke="var(--color-cloud)"
      />

      {DROP_POSITIONS.map((x, index) => (
        <path
          key={x}
          className="icon-part animate-drop"
          /* animationDelay est écrit en style et non en classe Tailwind :
             sa valeur vient d'un calcul, et Tailwind ne sait fabriquer que
             les classes écrites en clair dans le code source. */
          style={{ animationDelay: DROP_DELAYS[index] }}
          d={`M${x} 17.6v2.4`}
          stroke="var(--color-cyan)"
          strokeWidth={2}
        />
      ))}
    </IconBase>
  );
}
