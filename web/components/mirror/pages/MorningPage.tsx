/* ==========================================================================
 * components/mirror/pages/MorningPage.tsx — la page du matin
 *
 * Chaque widget est posé par un <Place> : une position debout, une position
 * couchée, en pixels miroir sur la toile de référence (voir Place.tsx).
 * Pour déplacer un widget, on change ses nombres ici — /mirror?calibrer
 * affiche la grille et les coordonnées pour viser juste.
 *
 * Pour l'instant, seuls l'heure, la météo, le bonjour et les priorités sont
 * posés : les autres widgets seront reconstruits un par un, et ajoutés ici
 * chacun avec son <Place>.
 *
 * Repères de la toile : marge de 72 sur les bords.
 *   debout  1080 × 1920 → contenu de x 72 à 1008 (largeur 936)
 *   couché  1920 × 1080 → contenu de x 72 à 1848
 * ========================================================================== */

import Place from "@/components/mirror/Place";
import Clock from "@/components/widgets/Clock";
import Greeting from "@/components/widgets/Greeting";
import Priorities from "@/components/widgets/Priorities";
import Weather from "@/components/widgets/Weather";

export default function MorningPage() {
  return (
    <>
      <Place portrait={{ x: 72, y: 72 }} landscape={{ x: 72, y: 72 }}>
        <Clock />
      </Place>

      <Place
        portrait={{ x: 608, y: 50, w: 420 }}
        landscape={{ x: 180, y: 380 }}
      >
        <Weather />
      </Place>

      <Place
        portrait={{ x: 72, y: 400, w: 936 }}
        landscape={{ x: 580, y: 72, w: 680 }}
      >
        <Greeting />
      </Place>

      {/* Sous le bonjour debout (son émoticône finit vers y 620) ; dans la
          colonne de droite couché. */}
      <Place
        portrait={{ x: 72, y: 680, w: 936 }}
        landscape={{ x: 1294, y: 72, w: 554 }}
      >
        <Priorities />
      </Place>
    </>
  );
}
