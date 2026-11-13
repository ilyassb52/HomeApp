/* ==========================================================================
 * components/widgets/Weather.tsx — la météo du jour, en haut à droite
 *
 * Il affiche l'icône correspondant au temps, la température, puis le temps en
 * toutes lettres avec les minimales et maximales.
 *
 * LE TABLEAU DE CORRESPONDANCE
 *
 * La section 10 du brief fixe quelle émoticône va avec quel temps. Ce
 * tableau est exporté : WeatherTomorrow et WeatherWeekend s'en servent
 * aussi — le brief dit « même logique ».
 * ========================================================================== */

import Emoji from "@/components/ui/Emoji";
import type { EmojiName } from "@/lib/emojis";
import { mockWeather } from "@/lib/mock";
import type { Weather as WeatherData, WeatherCondition } from "@/lib/types";

export const WEATHER_EMOJIS: Record<WeatherCondition, EmojiName> = {
  sunny: "sun",
  cloudy: "sunCloud",
  rainy: "rainCloud",
  night: "moon",
};

/* Repli imposé par la section 10 : une condition inconnue — venue plus tard
 * d'une API — ne doit pas vider l'écran. On affiche un ciel nuageux et on le
 * signale. */
const FALLBACK_EMOJI: EmojiName = "sunCloud";

export function getWeatherEmoji(condition: WeatherCondition): EmojiName {
  const emoji = WEATHER_EMOJIS[condition];

  if (!emoji) {
    console.warn(
      `[weather] Condition inconnue « ${condition} » : l'émoticône nuageuse est utilisée.`,
    );
    return FALLBACK_EMOJI;
  }

  return emoji;
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
  return (
    <div className="flex items-center gap-5">
      <Emoji name={getWeatherEmoji(data.condition)} size={iconSize} />
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
