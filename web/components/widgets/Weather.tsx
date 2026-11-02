/* ==========================================================================
 * components/widgets/Weather.tsx — la météo du jour, en haut à droite
 *
 * Il affiche l'icône correspondant au temps, la température, puis le temps en
 * toutes lettres avec les minimales et maximales.
 *
 * LE TABLEAU DE CORRESPONDANCE
 *
 * La section 10 du brief fixe quelle icône et quelle couleur vont avec quel
 * temps. Ce tableau est exporté : WeatherTomorrow et WeatherWeekend, aux
 * tâches 7 et 8, s'en serviront aussi — le brief dit « même logique ».
 *
 * Les classes de couleur y sont écrites EN TOUTES LETTRES, et non fabriquées
 * à partir du nom du ton. C'est obligatoire : Tailwind lit le code source
 * comme du texte avant l'exécution, donc "text-" + tone ne produirait rien.
 * ========================================================================== */

import Moon from "@/components/icons/Moon";
import RainCloud from "@/components/icons/RainCloud";
import Sun from "@/components/icons/Sun";
import SunCloud from "@/components/icons/SunCloud";
import type { IconProps } from "@/components/icons/IconBase";
import { mockWeather } from "@/lib/mock";
import type { Weather as WeatherData, WeatherCondition } from "@/lib/types";

type WeatherLook = {
  Icon: (props: IconProps) => React.ReactElement;
  className: string;
};

export const WEATHER_LOOKS: Record<WeatherCondition, WeatherLook> = {
  sunny: { Icon: Sun, className: "text-amber" },
  cloudy: { Icon: SunCloud, className: "text-cloud" },
  rainy: { Icon: RainCloud, className: "text-cyan" },
  night: { Icon: Moon, className: "text-moon" },
};

/* Repli imposé par la section 10 : une condition inconnue — venue plus tard
 * d'une API — ne doit pas vider l'écran. On dessine un ciel nuageux et on le
 * signale. */
const FALLBACK_LOOK = WEATHER_LOOKS.cloudy;

export function getWeatherLook(condition: WeatherCondition): WeatherLook {
  const look = WEATHER_LOOKS[condition];

  if (!look) {
    console.warn(
      `[weather] Condition inconnue « ${condition} » : l'icône nuageuse est utilisée.`,
    );
    return FALLBACK_LOOK;
  }

  return look;
}

/* --------------------------------------------------------------------------
 * Le bloc réutilisé par les trois widgets météo : une icône et une
 * température. WeatherTomorrow et WeatherWeekend l'emploieront en plus petit.
 * -------------------------------------------------------------------------- */
export function WeatherReading({
  data,
  iconSize = 92,
  temperatureClassName = "text-mp-102",
}: {
  data: WeatherData;
  iconSize?: number;
  temperatureClassName?: string;
}) {
  const { Icon, className } = getWeatherLook(data.condition);

  return (
    <div className="flex items-center gap-5">
      <Icon size={iconSize} className={className} />
      <p
        className={`${temperatureClassName} leading-none font-extralight text-ink`}
      >
        {data.temperature}°
      </p>
    </div>
  );
}

export default function Weather() {
  const data = mockWeather;

  return (
    /* items-end : la zone header-right est alignée à droite, les deux lignes
       doivent donc se caler sur le bord droit. */
    <div className="flex flex-col items-end gap-mp-10">
      <WeatherReading data={data} />
      <p className="text-mp-30 font-light text-muted">
        {data.label} · {data.minTemperature}° / {data.maxTemperature}°
      </p>
    </div>
  );
}
