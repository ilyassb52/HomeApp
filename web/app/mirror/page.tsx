/* ==========================================================================
 * app/mirror/page.tsx — l'écran du miroir, à l'adresse « /mirror »
 *
 * ÉTAT : provisoire. Le cadre est en place (tâche 2), mais ce qu'il contient
 * est encore écrit en dur ici, uniquement pour vérifier à l'œil que le cadre
 * et les cartes se comportent comme prévu.
 *
 * À la tâche 3, tout l'intérieur du <MirrorFrame> disparaît et est remplacé
 * par trois lignes : calculer le mode, lire la liste de widgets de ce mode
 * dans config/layouts.json, demander au registre le composant de chacun.
 * Cette page ne connaîtra alors plus aucun widget en particulier.
 * ========================================================================== */

import MirrorFrame from "@/components/mirror/MirrorFrame";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";

export default function MirrorPage() {
  return (
    /* MirrorFrame fournit la zone de 1080 × 1920 px, ses marges de 72 px et
     * l'empilement vertical. Tout ce qui suit est donc écrit en pixels réels
     * du miroir, sans se préoccuper de la taille de la fenêtre. */
    <MirrorFrame>
      {/* --- DÉMONSTRATION PROVISOIRE — supprimée à la tâche 3 ------------ */}

      {/* gap-[36px] : l'espacement entre blocs du brief (fourchette 33–39 px). */}
      <div className="flex flex-col gap-[36px]">
        <SectionLabel>Cadre et cartes</SectionLabel>

        {/* Les trois états de Card, pour les comparer d'un coup d'œil.
         * text-[34px] font-light = le style « texte de liste » du brief. */}
        <Card tone="cyan">
          <p className="text-[34px] font-light">
            Carte discrète : bordure de 1 px dans le ton.
          </p>
        </Card>

        <Card tone="neon-green" variant="tinted">
          <p className="text-[34px] font-light">
            Carte mise en avant : fond teinté, bordure de 1,5 px.
          </p>
        </Card>

        <Card tone="amber" variant="alert">
          <p className="text-[34px] font-light">
            Carte d&apos;alerte : la même, plus une lueur autour.
          </p>
        </Card>
      </div>

      {/* mt-auto pousse ce bloc tout en bas de la colonne : c'est le mécanisme
       * qui collera le vrai pied de page au bas de l'écran à la tâche 3. */}
      <p className="mt-auto text-[24px] font-light text-muted">
        Pied de page, collé en bas du cadre.
      </p>

      {/* --- FIN DE LA DÉMONSTRATION PROVISOIRE --------------------------- */}
    </MirrorFrame>
  );
}
