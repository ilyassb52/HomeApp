/* ==========================================================================
 * components/widgets/Clock.tsx — l'heure et la date
 *
 * Premier widget du projet, et le modèle des autres : un fichier, un widget,
 * qui va chercher ses propres données et gère son propre style. Aucun widget
 * n'en importe un autre.
 *
 * Le format de l'heure n'est pas écrit ici : il vient de lib/time.ts, qui
 * est le seul endroit du projet où l'on lit l'heure de Paris. C'est ce qui
 * empêche quiconque d'écrire date.getHours() par distraction et d'obtenir
 * l'heure de la machine au lieu de celle du foyer.
 *
 * Le soir, la page lui passe showMoon et une lune vient se poser à gauche
 * de l'heure. Le widget ne sait pas qu'il est le soir : il lit une prop,
 * rien de plus.
 * ========================================================================== */

"use client";

import { useEffect, useState } from "react";
import Moon from "@/components/icons/Moon";
import { formatParisDate, formatParisTime } from "@/lib/time";

export default function Clock({ showMoon = false }: { showMoon?: boolean }) {
  /* useState(() => new Date()) : la fonction n'est appelée qu'au tout premier
   * affichage. Écrire useState(new Date()) fabriquerait une date inutile à
   * chaque rendu, soit une fois par seconde. */
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    /* Le brief demande une mise à jour chaque seconde, alors que seules les
     * minutes sont affichées. C'est volontaire : la minute change ainsi dans
     * la seconde, au lieu d'attendre jusqu'à 59 secondes. */
    const intervalId = setInterval(() => setNow(new Date()), 1000);

    /* Sans ce nettoyage, l'intervalle continuerait de tourner après la
     * disparition du composant — et un deuxième s'ajouterait au retour. */
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-6">
        {showMoon ? <Moon size={84} className="text-moon" /> : null}

        {/* 186 px, graisse 200 : les valeurs du tableau de typographie du
            brief. leading-none supprime l'interligne, qui à cette taille
            ajouterait une cinquantaine de pixels de vide sous le texte. */}
        <p className="text-mp-186 leading-none font-extralight text-ink">
          {formatParisTime(now)}
        </p>
      </div>

      <p className="mt-mp-12 text-mp-34 font-light text-muted">
        {formatParisDate(now)}
      </p>
    </div>
  );
}
