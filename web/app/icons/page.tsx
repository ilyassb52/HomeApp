/* ==========================================================================
 * app/icons/page.tsx — galerie des émoticônes, à l'adresse « /icons »
 *
 * OUTIL DE DÉVELOPPEMENT, pas un écran du miroir. Il affiche toutes les
 * émoticônes de lib/emojis.ts avec leur nom, pour :
 *   - vérifier d'un coup d'œil qu'elles sont bien téléchargées et animées ;
 *   - retrouver le nom à écrire dans <Emoji name="…" /> ;
 *   - essayer les réglages d'animation (pause, vitesse, boucles, rejouer)
 *     avant de les utiliser dans un widget.
 *
 * La galerie se remplit toute seule à partir du catalogue : une émoticône
 * ajoutée dans lib/emojis.ts apparaît ici sans rien modifier.
 *
 * Elle déroge volontairement à deux règles de globals.css — le curseur
 * réapparaît et la page défile — parce qu'elle se regarde sur un ordinateur,
 * avec une souris, et non derrière un miroir.
 * ========================================================================== */

"use client";

import { useState } from "react";
import Emoji from "@/components/ui/Emoji";
import SectionLabel from "@/components/ui/SectionLabel";
import { EMOJIS, type EmojiName } from "@/lib/emojis";

/* Object.keys perd le type précis des clés : on le lui rend avec « as ». */
const EMOJI_NAMES = Object.keys(EMOJIS) as EmojiName[];

/* Les choix proposés pour le nombre de lectures. */
const LOOP_CHOICES = [
  { label: "À l'infini", value: true },
  { label: "1 fois", value: 1 },
  { label: "3 fois", value: 3 },
] as const;

export default function IconsGalleryPage() {
  /* Les réglages essayés, appliqués à toutes les émoticônes de la page. */
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState<boolean | number>(true);
  /* « Rejouer » ajoute 1 : la valeur change, donc les émoticônes repartent
   * du début (c'est la prop trigger). */
  const [replayCount, setReplayCount] = useState(0);

  return (
    <main className="h-screen cursor-auto overflow-y-auto bg-bg p-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <SectionLabel>Émoticônes animées</SectionLabel>

        {/* --- La barre de réglages --- */}
        <div className="flex flex-wrap items-center gap-6 text-[16px] text-ink">
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            className="rounded-xl border border-ink/20 px-4 py-2"
          >
            {playing ? "Pause" : "Lecture"}
          </button>

          <button
            type="button"
            onClick={() => setReplayCount(replayCount + 1)}
            className="rounded-xl border border-ink/20 px-4 py-2"
          >
            Rejouer
          </button>

          <label className="flex items-center gap-3">
            Vitesse ×{speed}
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.25}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </label>

          <div className="flex gap-2">
            {LOOP_CHOICES.map((choice) => (
              <button
                key={choice.label}
                type="button"
                onClick={() => setLoop(choice.value)}
                className={`rounded-xl border px-4 py-2 ${
                  loop === choice.value ? "border-ink" : "border-ink/20"
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- La grille --- */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {EMOJI_NAMES.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-3 rounded-2xl border border-ink/10 p-6"
            >
              <Emoji
                name={name}
                size={72}
                playing={playing}
                speed={speed}
                loop={loop}
                trigger={replayCount}
              />
              <p className="text-[18px] font-semibold text-ink">{name}</p>
              <p className="text-[15px] font-light text-muted">
                {EMOJIS[name]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
