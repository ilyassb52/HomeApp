/* ==========================================================================
 * components/mirror/pages/MorningPage.tsx — la page du matin
 *
 * Chaque widget est posé par un <Place> : une position debout, une position
 * couchée, en pixels miroir sur la toile de référence (voir Place.tsx).
 * Pour déplacer un widget, on change ses nombres ici — /mirror?calibrer
 * affiche la grille et les coordonnées pour viser juste.
 *
 * Repères de la toile : marge de 72 sur les bords.
 *   debout  1080 × 1920 → contenu de x 72 à 1008 (largeur 936)
 *   couché  1920 × 1080 → colonne d'en-tête de 560 à gauche, puis deux
 *                         colonnes de 554 (x 704 et x 1294)
 * ========================================================================== */

import Place from "@/components/mirror/Place";
import Clock from "@/components/widgets/Clock";
import Footer from "@/components/widgets/Footer";
import Greeting from "@/components/widgets/Greeting";
import Habits from "@/components/widgets/Habits";
import Priorities from "@/components/widgets/Priorities";
import Transport from "@/components/widgets/Transport";
import Weather from "@/components/widgets/Weather";

export default function MorningPage() {
  return (
    <>
      <Place portrait={{ x: 72, y: 72}} landscape={{ x: 72, y: 72 }}>
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
        landscape={{ x: 704, y: 72, w: 554 }}
      >
        <Greeting />
      </Place>

      <Place
        portrait={{ x: 72, y: 560, w: 936 }}
        landscape={{ x: 704, y: 324, w: 554 }}
      >
        <Transport />
      </Place>

      <Place
        portrait={{ x: 72, y: 800, w: 936 }}
        landscape={{ x: 700, y: 600, w: 554 }}
      >
        <Habits />
      </Place>

      <Place
        portrait={{ x: 72, y: 1104, w: 936 }}
        landscape={{ x: 1294, y: 72, w: 554 }}
      >
        <Priorities />
      </Place>

      <Place
        portrait={{ x: 72, y: 1810, w: 936 }}
        landscape={{ x: 72, y: 980, w: 1776 }}
      >
        <Footer left="Page matin" right="Mis à jour à {heure}" />
      </Place>
    </>
  );
}
