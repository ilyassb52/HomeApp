/* ==========================================================================
 * components/ui/CheckCircle.tsx — le cercle à cocher d'une priorité
 *
 * Vide quand la priorité reste à faire, rempli d'un point de couleur quand
 * elle est faite. Utilisé par le widget du miroir et par la page téléphone.
 *
 * Il ne choisit pas sa couleur : il lit la variable --tone posée par la
 * Card qui l'entoure, comme la classe .tone-dot de globals.css.
 *
 * Ce n'est qu'un dessin. Sur le téléphone, c'est le <button> autour de lui
 * qui réagit au doigt.
 * ========================================================================== */

export default function CheckCircle({
  done,
  size,
}: {
  done: boolean;
  /** Diamètre du cercle, en pixels. */
  size: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border-2"
      style={{
        width: size,
        height: size,
        borderColor: "color-mix(in srgb, var(--tone) 55%, transparent)",
      }}
    >
      {done ? (
        /* Le point fait un peu plus de la moitié du cercle : 18 px dans un
         * cercle de 34 px sur le miroir. */
        <span
          className="tone-dot block rounded-full"
          style={{ width: size * 0.53, height: size * 0.53 }}
        />
      ) : null}
    </span>
  );
}
