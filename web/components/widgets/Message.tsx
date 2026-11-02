/* ==========================================================================
 * components/widgets/Message.tsx — le mot laissé par quelqu'un du foyer
 *
 * Cœur qui bat, « MOT DE [prénom] », puis le texte. Le prénom vient du
 * profil désigné par le message, jamais écrit en dur ici.
 *
 * Comme l'alerte, ce widget disparaît complètement s'il n'y a pas de
 * message — sans laisser d'espace dans la pile.
 * ========================================================================== */

import Heart from "@/components/icons/Heart";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import { getProfileName, mockMessage } from "@/lib/mock";

export default function Message() {
  const message = mockMessage;

  if (!message) {
    return null;
  }

  return (
    <Card tone="magenta">
      <div className="flex items-start gap-6">
        <Heart size={64} className="text-magenta" />

        <div className="flex flex-col gap-[8px]">
          <SectionLabel>
            Mot de {getProfileName(message.fromProfileId)}
          </SectionLabel>
          <p className="text-[34px] leading-snug font-light text-ink">
            {message.text}
          </p>
        </div>
      </div>
    </Card>
  );
}
