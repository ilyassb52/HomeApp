/* ==========================================================================
 * components/widgets/WeatherTomorrow.tsx — la météo de demain, le soir
 *
 * Même logique que Weather, comme l'indique le brief : il réutilise le
 * tableau de correspondance temps → icône → couleur et le bloc icône +
 * température. Seules changent la source des données et la ligne « Demain ».
 *
 * C'est pour cela que ces deux morceaux sont exportés par Weather.tsx plutôt
 * que recopiés : changer l'icône de la pluie se fait à un seul endroit.
 * ========================================================================== */

import { WeatherReading } from "@/components/widgets/Weather";
import { mockWeatherTomorrow } from "@/lib/mock";

export default function WeatherTomorrow() {
  const data = mockWeatherTomorrow;

  return (
    <div className="flex flex-col items-end gap-[6px]">
      {/* Le petit titre est en texte secondaire et non en SectionLabel : il
          coiffe une valeur dans l'en-tête, pas une liste. */}
      <p className="text-[27px] font-light text-muted">Demain</p>

      {/* Un cran plus petit que la météo du jour : l'information principale
          du soir est ailleurs, dans la revue de la journée. */}
      <WeatherReading
        data={data}
        iconSize={76}
        temperatureClassName="text-[84px]"
      />

      <p className="text-[27px] font-light text-muted">{data.label}</p>
    </div>
  );
}
