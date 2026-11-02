/* ==========================================================================
 * components/widgets/Menu.tsx — ce qu'on mange demain
 *
 * Casserole fumante, titre, plat, et un rappel de préparation facultatif
 * (« Sortir le fromage ce soir »). Le rappel est le seul élément optionnel :
 * sans lui, la ligne disparaît au lieu de laisser un vide.
 * ========================================================================== */

import CookingPot from "@/components/icons/CookingPot";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import { mockMenu } from "@/lib/mock";

export default function Menu() {
  const menu = mockMenu;

  return (
    <Card tone="coral">
      <div className="flex items-center gap-6">
        <CookingPot size={72} className="text-coral" />

        <div className="flex flex-col gap-[8px]">
          <SectionLabel>Au menu demain</SectionLabel>
          <p className="text-[36px] leading-tight font-semibold text-ink">
            {menu.dish}
          </p>

          {menu.reminder ? (
            <p className="text-[30px] font-light text-muted">{menu.reminder}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
