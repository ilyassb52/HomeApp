/* ==========================================================================
 * components/ui/Card.tsx — la carte, le bloc visuel de base de l'écran
 *
 * Presque tout ce qui s'affiche sur le miroir est posé dans une carte : une
 * priorité, les horaires de train, l'alerte poubelles, la liste de courses.
 * Le brief (section 4) en décrit trois états :
 *
 *   plain  — fond sombre, fine bordure de 1 px dans la couleur du thème
 *   tinted — « mise en avant » : le fond prend la teinte de la couleur,
 *            la bordure passe à 1,5 px (revue du soir, courses)
 *   alert  — comme tinted, plus une lueur autour de la carte (l'alerte)
 *
 * DEUX IDÉES À COMPRENDRE ICI
 *
 * 1. La couleur n'est pas écrite dans la carte. La carte reçoit un « ton »
 *    (cyan, coral…) et se contente de l'appliquer. C'est pour ça qu'un seul
 *    composant suffit pour toutes les cartes de l'écran, au lieu d'un
 *    composant par couleur.
 *
 * 2. L'apparence est décrite en CSS, dans les classes .card de globals.css,
 *    pas ici. Raison : Tailwind lit le code source comme du texte avant
 *    l'exécution, donc une classe fabriquée par calcul — "border-" + tone —
 *    n'existerait jamais. En passant la couleur par une variable CSS, on
 *    écrit l'apparence une seule fois et elle s'adapte au ton reçu.
 * ========================================================================== */

import type { CSSProperties, ReactNode } from "react";

/* --------------------------------------------------------------------------
 * 1. Les tons disponibles
 *
 * Ce sont les cinq couleurs de thème de la section 4. Elles sont volontairement
 * listées ici et pas dans lib/types.ts : pour l'instant, la carte est seule à
 * s'en servir. Dès qu'un deuxième fichier en aura besoin (les widgets, à la
 * tâche 6), ce type déménagera dans lib/types.ts — on factorise à la deuxième
 * occurrence, pas avant.
 * -------------------------------------------------------------------------- */
export type CardTone = "amber" | "cyan" | "magenta" | "neon-green" | "coral";

export type CardVariant = "plain" | "tinted" | "alert";

/* Chaque état correspond à une combinaison de classes CSS. Les écrire dans un
 * objet plutôt qu'en enchaînant des « si » garde le composant lisible, et
 * ajouter un état plus tard ne demande qu'une ligne ici. */
const VARIANT_CLASSES: Record<CardVariant, string> = {
  plain: "card",
  tinted: "card card--tinted",
  alert: "card card--tinted card--alert",
};

type CardProps = {
  children: ReactNode;
  /** Couleur du thème de la carte. Par défaut amber, l'accent du brief. */
  tone?: CardTone;
  /** Niveau de mise en avant. Par défaut la carte discrète. */
  variant?: CardVariant;
  /** Pour la mise en page du widget qui l'utilise (largeur, marges…). */
  className?: string;
};

/* --------------------------------------------------------------------------
 * 2. Le composant
 * -------------------------------------------------------------------------- */
export default function Card({
  children,
  tone = "amber",
  variant = "plain",
  className = "",
}: CardProps) {
  return (
    <div
      className={`${VARIANT_CLASSES[variant]} ${className}`}
      /* On pose une variable CSS nommée --tone sur cette carte. Les classes
       * .card de globals.css la lisent pour colorer bordure, fond et lueur.
       * Le « as CSSProperties » rassure TypeScript : il ne connaît que les
       * propriétés CSS standard et pas nos variables personnalisées. */
      style={{ "--tone": `var(--color-${tone})` } as CSSProperties}
    >
      {children}
    </div>
  );
}
