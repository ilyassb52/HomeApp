/* ==========================================================================
 * components/mirror/pages/EveningPage.tsx — la page du soir
 *
 * Même principe que MorningPage.tsx : un <Place> par widget, une position
 * debout et une position couchée. Les réglages du soir (la lune à côté de
 * l'heure, l'alerte poubelles…) sont de simples props.
 * ========================================================================== */

import Place from "@/components/mirror/Place";
import Agenda from "@/components/widgets/Agenda";
import Alert from "@/components/widgets/Alert";
import Clock from "@/components/widgets/Clock";
import DailyReview from "@/components/widgets/DailyReview";
import Footer from "@/components/widgets/Footer";
import Menu from "@/components/widgets/Menu";
import Message from "@/components/widgets/Message";
import WeatherTomorrow from "@/components/widgets/WeatherTomorrow";

export default function EveningPage() {
  return (
    <>
      <Place portrait={{ x: 72, y: 72 }} landscape={{ x: 72, y: 72 }}>
        <Clock showMoon />
      </Place>

      <Place
        portrait={{ x: 728, y: 72, w: 280 }}
        landscape={{ x: 72, y: 380, w: 560 }}
      >
        <WeatherTomorrow />
      </Place>

      <Place
        portrait={{ x: 72, y: 372, w: 936 }}
        landscape={{ x: 704, y: 72, w: 554 }}
      >
        <Alert kind="trash" />
      </Place>

      <Place
        portrait={{ x: 72, y: 579, w: 936 }}
        landscape={{ x: 704, y: 320, w: 554 }}
      >
        <DailyReview />
      </Place>

      <Place
        portrait={{ x: 72, y: 1040, w: 936 }}
        landscape={{ x: 1294, y: 612, w: 554 }}
      >
        <Agenda max={4} />
      </Place>

      <Place
        portrait={{ x: 72, y: 1373, w: 936 }}
        landscape={{ x: 1294, y: 72, w: 554 }}
      >
        <Menu />
      </Place>

      <Place
        portrait={{ x: 72, y: 1623, w: 936 }}
        landscape={{ x: 1294, y: 320, w: 554 }}
      >
        <Message />
      </Place>

      <Place
        portrait={{ x: 72, y: 1820, w: 936 }}
        landscape={{ x: 72, y: 980, w: 1776 }}
      >
        <Footer left="Bonne soirée {prenom}" right="Extinction auto à 23 h" />
      </Place>
    </>
  );
}
