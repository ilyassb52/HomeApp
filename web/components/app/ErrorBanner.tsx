/* ==========================================================================
 * components/app/ErrorBanner.tsx — le bandeau d'erreur des pages téléphone
 *
 * Le dernier échec (« Ajout impossible. »…), affiché en haut de la page.
 * Écrit à l'identique dans PrioritiesManager et ShoppingManager, il a
 * déménagé ici à l'arrivée de l'agenda, sa troisième page.
 * ========================================================================== */

export default function ErrorBanner({ message }: { message: string | null }) {
  if (message === null) {
    return null;
  }

  return (
    /* role="alert" fait lire le message aussitôt par un lecteur d'écran,
     * sans qu'il ait à le chercher. */
    <p
      role="alert"
      className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral"
    >
      {message}
    </p>
  );
}
