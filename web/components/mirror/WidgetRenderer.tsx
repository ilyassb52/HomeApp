/* ==========================================================================
 * components/mirror/WidgetRenderer.tsx — place les widgets dans les zones
 *
 * SON RÔLE, ET CE QU'IL NE FAIT PAS
 *
 * Il reçoit une liste déjà vérifiée par lib/layouts.ts et répond à une seule
 * question : où chaque widget se pose-t-il à l'écran ? Il ne connaît aucun
 * widget en particulier — il ne sait même pas ce qu'est une horloge. Il lit
 * un nom, demande le composant au registre, et l'affiche.
 *
 * Partage des rôles, à garder en tête :
 *   lib/layouts.ts  → QUOI afficher (et écarte ce qui est invalide)
 *   WidgetRenderer  → OÙ l'afficher
 *   le widget       → COMMENT il se dessine et où il prend ses données
 * ========================================================================== */

"use client";

import { useEffect, useRef } from "react";
import { widgetRegistry } from "@/lib/widget-registry";
import type { WidgetArea, WidgetConfig } from "@/lib/types";

/* Espacement entre blocs : le milieu de la fourchette 33–39 px du brief. */
const BLOCK_GAP = 36;

/* --------------------------------------------------------------------------
 * 1. Afficher un widget
 *
 * La majuscule de « Component » n'est pas décorative : React affiche en
 * composant ce qui commence par une majuscule, et en balise HTML ce qui
 * commence par une minuscule. Avec « component », React chercherait une
 * balise <component> qui n'existe pas.
 * -------------------------------------------------------------------------- */
function renderWidget(widget: WidgetConfig) {
  const Component = widgetRegistry[widget.type];

  if (!Component) {
    /* Deux cas arrivent ici, et aucun ne doit casser l'écran :
     *   - un type inconnu dans la configuration (faute de frappe) ;
     *   - un widget pas encore écrit — le cas courant jusqu'à la tâche 8. */
    console.warn(
      `[widgets] Aucun composant pour le type « ${widget.type} » (widget « ${widget.id} ») : il est ignoré.`,
    );
    return null;
  }

  /* key sert à React pour suivre chaque élément d'une liste d'un affichage à
   * l'autre. L'identifiant de la configuration est parfait pour ça : il est
   * unique, lib/layouts.ts l'a vérifié. */
  return <Component key={widget.id} settings={widget.settings} />;
}

/* --------------------------------------------------------------------------
 * 2. Le composant
 * -------------------------------------------------------------------------- */
export default function WidgetRenderer({
  widgets,
}: {
  widgets: WidgetConfig[];
}) {
  const mainRef = useRef<HTMLElement>(null);

  /* Avertissement de développement exigé par la section 10 : la zone
   * principale ne défile pas et ne compresse rien, donc un widget de trop
   * disparaît purement et simplement sous le bord de l'écran. Sans ce
   * message, rien ne le signalerait. */
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const main = mainRef.current;
    if (!main) return;

    /* scrollHeight = hauteur réelle du contenu ;
     * clientHeight = hauteur visible. Le contenu déborde si le premier
     * dépasse le second. */
    const overflow = main.scrollHeight - main.clientHeight;
    if (overflow > 0) {
      console.warn(
        `[widgets] La zone principale déborde de ${overflow} px : le bas est masqué. Retire un widget de config/layouts.json.`,
      );
    }
  }, [widgets]);

  /* Un petit raccourci pour piocher les widgets d'une zone, sans répéter
   * trois fois le même filtre. */
  const inArea = (area: WidgetArea) =>
    widgets.filter((widget) => widget.area === area);

  return (
    /* <> … </> est un « fragment » : il regroupe plusieurs éléments sans
     * ajouter de boîte dans la page. Les trois zones sont ainsi les enfants
     * directs de la colonne de MirrorFrame. */
    <>
      {/* En-tête : heure et date à gauche, météo à droite. */}
      <header
        className="flex items-start justify-between"
        style={{ gap: BLOCK_GAP }}
      >
        <div className="flex flex-col" style={{ gap: BLOCK_GAP }}>
          {inArea("header-left").map(renderWidget)}
        </div>
        <div className="flex flex-col items-end" style={{ gap: BLOCK_GAP }}>
          {inArea("header-right").map(renderWidget)}
        </div>
      </header>

      {/* Zone principale : empilement vertical, dans l'ordre de la config.
          flex-1 lui fait prendre toute la hauteur restante, ce qui pousse le
          pied de page en bas. overflow-hidden applique la règle de la
          section 10 : pas de défilement, le surplus est masqué. */}
      <main
        ref={mainRef}
        className="flex flex-1 flex-col overflow-hidden"
        style={{ gap: BLOCK_GAP, marginTop: BLOCK_GAP }}
      >
        {inArea("main").map(renderWidget)}
      </main>

      {/* Pied de page, collé en bas du cadre. */}
      <footer
        className="flex items-end justify-between"
        style={{ gap: BLOCK_GAP, marginTop: BLOCK_GAP }}
      >
        {inArea("footer").map(renderWidget)}
      </footer>
    </>
  );
}
