/* ==========================================================================
 * components/widgets/Clock.tsx — l'heure et la date
 *
 * C'est le premier widget du projet, et pour l'instant le seul réellement
 * écrit. Il sert de modèle aux dix-huit autres : un fichier, un widget, qui
 * va chercher ses propres données et gère son propre style. Aucun widget
 * n'en importe un autre.
 *
 * LE PIÈGE DU FUSEAU HORAIRE
 *
 * Les fonctions habituelles de JavaScript — date.getHours(), toLocaleString()
 * sans précision — donnent l'heure DE LA MACHINE. Sur ton PC à Paris, tout
 * semble marcher. Le jour où le code tourne ailleurs, ou pendant un test
 * automatique, l'heure est fausse sans prévenir.
 *
 * On passe donc systématiquement par Intl.DateTimeFormat en précisant
 * timeZone, comme l'impose la section 10 du brief. C'est la seule façon
 * d'obtenir « l'heure de Paris » quelle que soit la machine.
 * ========================================================================== */

"use client";

import { useEffect, useState } from "react";

/* Le fuseau du foyer. Il déménagera dans lib/ à la tâche 4, quand getMode()
 * en aura besoin lui aussi : on factorise à la deuxième occurrence. */
const TIME_ZONE = "Europe/Paris";

/* --------------------------------------------------------------------------
 * 1. Les deux formats d'affichage
 *
 * Construits une seule fois, hors du composant : un Intl.DateTimeFormat coûte
 * cher à fabriquer, et celui-ci ne change jamais. Le recréer à chaque seconde
 * serait du gaspillage pur.
 * -------------------------------------------------------------------------- */
const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** « lundi 26 octobre » → « Lundi 26 octobre ». Le français n'écrit pas les
 *  jours avec une majuscule, mais le brief demande cette forme à l'écran. */
function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* --------------------------------------------------------------------------
 * 2. Le composant
 *
 * Il ne reçoit aucune propriété pour l'instant. Le registre l'autorise : un
 * composant qui ignore les réglages reste compatible. La tâche 5 lui ajoutera
 * { settings } pour lire showMoon et afficher la lune du mode soir.
 * -------------------------------------------------------------------------- */
export default function Clock() {
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
      {/* 186 px, graisse 200 : les valeurs du tableau de typographie du brief.
          leading-none supprime l'interligne, qui à cette taille ajouterait
          une cinquantaine de pixels de vide sous le texte. */}
      <p className="text-[186px] leading-none font-extralight text-ink">
        {timeFormatter.format(now)}
      </p>
      <p className="mt-[12px] text-[34px] font-light text-muted">
        {capitalizeFirstLetter(dateFormatter.format(now))}
      </p>
    </div>
  );
}
