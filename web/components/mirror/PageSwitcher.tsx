/* ==========================================================================
 * components/mirror/PageSwitcher.tsx — le bouton « page suivante »
 *
 * Un petit bouton discret dans le coin bas-droit de l'écran. Un clic (ou un
 * doigt sur la tablette) passe à la page suivante ; après la dernière, on
 * revient à la première.
 *
 * Il est volontairement isolé : le jour où l'on préférera glisser au doigt,
 * c'est ce seul fichier qu'on remplacera. La page ne connaît que onNext.
 * ========================================================================== */

export default function PageSwitcher({
  nextLabel,
  onNext,
}: {
  /** Le nom de la page qui s'affichera après le clic. */
  nextLabel: string;
  onNext: () => void;
}) {
  return (
    /* cursor-pointer : .mirror-screen cache le curseur partout, on le fait
     * réapparaître sur le bouton pour le viser à la souris.
     * opacity-30 : visible de près, presque invisible derrière le miroir. */
    <button
      type="button"
      onClick={onNext}
      className="absolute right-mp-24 bottom-mp-24 cursor-pointer rounded-full border border-ink/30 px-mp-24 py-mp-12 text-mp-24 font-light text-ink opacity-30 transition-opacity hover:opacity-100"
    >
      {nextLabel} →
    </button>
  );
}
