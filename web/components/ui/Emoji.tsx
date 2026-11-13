/* ==========================================================================
 * components/ui/Emoji.tsx — affiche une émoticône animée du catalogue
 *
 *   <Emoji name="sun" size={92} />
 *
 * Seuls name et size sont obligatoires. Les autres réglages ont une valeur
 * par défaut : sans eux, l'émoticône tourne en boucle, à vitesse normale.
 *
 *   playing={false}     pause : l'émoticône reste figée (voir freeze)
 *   speed={0.5}         vitesse : 0.5 = deux fois plus lent, 2 = deux fois
 *                       plus rapide
 *   loop={3}            nombre de lectures : 3 fois puis s'arrête.
 *                       true = à l'infini, false = une seule fois
 *   trigger={valeur}    déclenchement : chaque fois que cette valeur change,
 *                       l'animation repart du début. Ex. trigger={alert.id}
 *                       rejoue l'émoticône à chaque nouvelle alerte.
 *
 * COMMENT ÇA MARCHE
 *
 * Le fichier public/emoji/<nom>.json est une animation au format Lottie : il
 * décrit des formes et leurs mouvements. La bibliothèque lottie-web la
 * dessine dans une <div> et nous donne une « télécommande » (l'objet
 * animation) avec play(), stop(), setSpeed()… Ce composant ne fait que
 * brancher les props sur cette télécommande.
 *
 * L'ACCESSIBILITÉ
 *
 * aria-hidden dit aux lecteurs d'écran d'ignorer l'émoticône : l'information
 * est toujours écrite en toutes lettres à côté. Et si le système demande de
 * réduire les animations, l'émoticône reste figée, quoi que disent les props.
 * ========================================================================== */

"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";
import type { EmojiName } from "@/lib/emojis";
import { mp } from "@/lib/mirror-pixels";

/** Taille par défaut : lisible à deux mètres dans une carte. */
const DEFAULT_SIZE = 64;

type EmojiProps = {
  name: EmojiName;
  /** Taille affichée, en pixels miroir (voir lib/mirror-pixels.ts). */
  size?: number;
  /** false = en pause, figée sur une image. */
  playing?: boolean;
  /** 1 = vitesse normale, 0.5 = deux fois plus lent, 2 = deux fois plus vite. */
  speed?: number;
  /** true = à l'infini, false = une fois, un nombre = autant de lectures. */
  loop?: boolean | number;
  /** Quand cette valeur change, l'animation repart du début. */
  trigger?: unknown;
};

export default function Emoji({
  name,
  size = DEFAULT_SIZE,
  playing = true,
  speed = 1,
  loop = true,
  trigger,
}: EmojiProps) {
  /* La <div> dans laquelle lottie-web dessine. */
  const containerRef = useRef<HTMLDivElement>(null);

  /* La télécommande de l'animation, une fois chargée. Elle est rangée dans
   * un ref : un objet que React garde d'un affichage à l'autre sans y
   * toucher, et qu'on a donc le droit de modifier. */
  const animationRef = useRef<AnimationItem | null>(null);

  /* Le chargement prend un instant. Ce state passe à true quand la
   * télécommande est prête : les réglages ci-dessous se rejouent alors. */
  const [isLoaded, setIsLoaded] = useState(false);

  /* ------------------------------------------------------------------------
   * 1. Chargement — à l'affichage, et à nouveau si le nom change
   * ---------------------------------------------------------------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* « cancelled » protège d'un cas rare : le composant disparaît pendant
     * que la bibliothèque se charge encore. */
    let cancelled = false;

    /* import() à l'intérieur de l'effet, et non en haut du fichier :
     * lottie-web a besoin de la page (document), qui n'existe pas quand
     * Next.js prépare le HTML sur le serveur. « light » est sa version la
     * plus légère, suffisante pour ces animations. */
    import("lottie-web/build/player/lottie_light").then(
      ({ default: lottie }) => {
        if (cancelled) return;

        const animation = lottie.loadAnimation({
          container,
          path: `/emoji/${name}.json`,
          renderer: "svg",
          autoplay: false, // c'est l'effet « lecture » plus bas qui décide
        });
        animationRef.current = animation;

        /* lottie-web va chercher le fichier .json lui-même : on attend qu'il
         * l'ait reçu et dessiné (« DOMLoaded ») avant d'appliquer les
         * réglages, sinon il ne connaît pas encore la durée. */
        animation.addEventListener("DOMLoaded", () => setIsLoaded(true));

        /* Une fois toutes ses lectures terminées, l'émoticône revient à sa
         * pose de repos (voir showRestFrame). */
        animation.addEventListener("complete", () => showRestFrame(animation));
      },
    );

    /* Le nettoyage : on détruit l'animation quand le composant disparaît,
     * sinon elle continuerait de tourner (et de consommer) en arrière-plan. */
    return () => {
      cancelled = true;
      animationRef.current?.destroy();
      animationRef.current = null;
      setIsLoaded(false);
    };
  }, [name]);

  /* ------------------------------------------------------------------------
   * 2. Les réglages — chacun est rejoué dès que sa prop change
   *
   * La vitesse est posée AVANT de lancer la lecture, pour que la lecture
   * parte directement à la bonne vitesse.
   * ---------------------------------------------------------------------- */
  useEffect(() => {
    animationRef.current?.setSpeed(speed);
  }, [isLoaded, speed]);

  /* Lecture / pause. trigger et loop sont dans la liste : quand l'un d'eux
   * change, l'effet se rejoue et l'animation repart du début.
   *
   * Pourquoi le nombre de boucles est posé ICI, et pas dans son propre
   * effet : lottie-web compte les lectures déjà faites et s'arrête quand
   * ce compteur est ÉGAL au nombre demandé. Si on change loop pendant que
   * l'émoticône tourne déjà (compteur à 20, on demande 1), l'égalité
   * n'arrive jamais : elle boucle à l'infini. Il faut donc remettre le
   * compteur à zéro avec stop() à chaque changement de loop. */
  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;

    animation.loop = toLottieLoop(loop);

    if (playing && !prefersReducedMotion()) {
      /* stop() remet le compteur de lectures à zéro (voir ci-dessus). */
      animation.stop();
      animation.play();
    } else {
      freeze(animation);
    }
  }, [isLoaded, playing, trigger, loop]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      /* flexShrink 0 : dans une colonne étroite, une boîte flex écraserait
       * l'émoticône pour faire de la place au texte. C'est au texte de
       * passer à la ligne, pas à l'émoticône de rétrécir. */
      style={{ width: mp(size), height: mp(size), flexShrink: 0 }}
    />
  );
}

/* --------------------------------------------------------------------------
 * Petites fonctions utilitaires
 * -------------------------------------------------------------------------- */

/* Notre loop compte le nombre TOTAL de lectures (loop={3} = 3 fois).
 * lottie-web, lui, compte les répétitions APRÈS la première (3 = 4 fois).
 * Cette fonction traduit l'un dans l'autre. */
function toLottieLoop(loop: boolean | number): boolean | number {
  if (typeof loop === "boolean") return loop;
  return loop <= 1 ? false : loop - 1;
}

/* La pose de repos : l'image du MILIEU de l'animation. Ni la première ni la
 * dernière, qui sont parfois vides (la goutte d'eau et les livres
 * n'apparaissent qu'en cours d'animation). */
function showRestFrame(animation: AnimationItem) {
  animation.goToAndStop(Math.floor(animation.totalFrames / 2), true);
}

/* Met l'animation en pause.
 * - Si elle est en train de jouer : elle s'arrête sur l'image en cours,
 *   comme une vidéo qu'on met en pause.
 * - Si elle n'a pas encore joué : elle prend sa pose de repos. */
function freeze(animation: AnimationItem) {
  if (animation.currentFrame === 0) {
    showRestFrame(animation);
  } else {
    animation.pause();
  }
}

/* Le réglage « réduire les animations » du système (Windows, macOS…). */
function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
