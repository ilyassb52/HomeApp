/* ==========================================================================
 * components/mirror/MirrorFrame.tsx — le cadre de l'écran
 *
 * LE PROBLÈME QU'IL RÉSOUT
 *
 * Le vrai miroir est un écran vertical de 1080 × 1920 pixels. Mais pendant
 * tout le développement, on regarde le résultat dans une fenêtre de
 * navigateur sur un PC, qui n'a ni cette taille ni cette forme.
 *
 * Deux solutions existaient :
 *   - tout dimensionner en pourcentages, et le dessin change de proportions
 *     selon la fenêtre : les 186 px de l'heure ne voudraient plus rien dire ;
 *   - dessiner TOUJOURS dans une zone de 1080 × 1920 px, puis réduire
 *     l'ensemble comme une photo pour qu'il tienne dans la fenêtre.
 *
 * C'est la deuxième qui est retenue par le brief. Conséquence pratique :
 * partout ailleurs dans le projet, tu écris des tailles en pixels réels du
 * miroir (186 px, 72 px de marge…) sans jamais te demander sur quel écran
 * ça tourne. Ce fichier est le seul à connaître la taille de la fenêtre.
 *
 * LES TROIS CALQUES
 *
 *   1. la zone visible  — occupe la fenêtre, noire, rien n'en dépasse
 *   2. le calque de fond — noir aujourd'hui, accueillera la vidéo d'arrière-plan
 *   3. le calque de contenu — les widgets, avec les marges de 72 px
 *
 * Le fond est un calque séparé parce que le brief (section 4) annonce une
 * vidéo d'arrière-plan à une étape suivante : elle se glissera dans le
 * calque 2, sous les widgets, sans toucher au reste.
 * Le décalage anti-marquage (tâche 9) bougera le calque 3, jamais le cadre.
 * ========================================================================== */

"use client";

import { useEffect, useState, type ReactNode } from "react";

/* --------------------------------------------------------------------------
 * 1. La taille du miroir
 *
 * Ces trois nombres ne sortent pas de ce fichier : c'est précisément ce qui
 * permet au reste du projet de les ignorer. Les nommer plutôt que les
 * recopier évite d'avoir à chercher « 1920 » partout le jour où l'écran
 * change de modèle.
 * -------------------------------------------------------------------------- */
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;

/** Marge extérieure de l'écran, en pixels du cadre (section 4 du brief). */
const FRAME_PADDING = 72;

/* --------------------------------------------------------------------------
 * 2. Le composant
 *
 * "use client" en haut du fichier : ce composant a besoin du navigateur pour
 * connaître la taille de la fenêtre. Sans cette ligne, Next l'exécuterait sur
 * le serveur, où l'objet window n'existe pas.
 * -------------------------------------------------------------------------- */
export default function MirrorFrame({ children }: { children: ReactNode }) {
  /* scale est le facteur de réduction : 1 = taille réelle, 0.5 = moitié.
   * null = « pas encore mesuré ». On distingue les deux cas pour éviter
   * d'afficher une fraction de seconde le cadre en taille réelle, qui
   * déborderait largement de la fenêtre. */
  const [scale, setScale] = useState<number | null>(null);

  /* useEffect(..., []) exécute son contenu une seule fois, après que le
   * composant est apparu à l'écran. C'est le bon endroit pour parler au
   * navigateur (ici : mesurer la fenêtre, écouter ses changements de taille). */
  useEffect(() => {
    function updateScale() {
      /* On compare la fenêtre au cadre dans les deux sens, et on garde le
       * plus petit des deux rapports : c'est celui qui garantit que RIEN ne
       * dépasse. Prendre le plus grand ferait sortir le cadre de l'écran. */
      const widthRatio = window.innerWidth / FRAME_WIDTH;
      const heightRatio = window.innerHeight / FRAME_HEIGHT;
      setScale(Math.min(widthRatio, heightRatio));
    }

    updateScale(); // une première fois, tout de suite

    /* Puis à chaque redimensionnement de la fenêtre (exigé par la section 10
     * du brief), sinon le cadre garderait l'échelle du premier affichage. */
    window.addEventListener("resize", updateScale);

    /* Ce que useEffect renvoie est le « nettoyage » : React l'appelle quand le
     * composant disparaît. Sans ça, l'écouteur resterait branché pour rien et
     * s'accumulerait à chaque réapparition du composant. */
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    /* Calque 1 — la zone visible.
     * fixed inset-0 = collé aux quatre bords de la fenêtre.
     * overflow-hidden = garantie de dernier recours : même en cas d'arrondi,
     * aucune barre de défilement n'apparaît. */
    <div className="fixed inset-0 overflow-hidden bg-bg">
      <div
        /* Le cadre lui-même. top-1/2 left-1/2 place son coin supérieur gauche
         * au centre de la fenêtre ; le translate(-50%, -50%) du style le
         * recule ensuite de la moitié de sa propre taille. Résultat : il est
         * centré, quelle que soit l'échelle. */
        className="absolute top-1/2 left-1/2"
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          /* Les tailles et le transform sont dans style={{…}} et non en
           * classes Tailwind, parce que leur valeur est calculée pendant
           * l'exécution. Tailwind, lui, lit le code source avant exécution :
           * il ne peut fabriquer que des classes écrites en clair. */
          transform: `translate(-50%, -50%) scale(${scale ?? 1})`,
          opacity: scale === null ? 0 : 1,
        }}
      >
        {/* Calque 2 — le fond. Noir uni à cette étape ; la vidéo
            d'arrière-plan viendra ici, sous les widgets. */}
        <div className="absolute inset-0 bg-bg" />

        {/* Calque 3 — le contenu.
            flex flex-col empile les zones de haut en bas : c'est ce qui
            permettra à la tâche 3 de coller le pied de page en bas. */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{ padding: FRAME_PADDING }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
