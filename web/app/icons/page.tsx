/* ==========================================================================
 * app/icons/page.tsx — galerie des icônes, à l'adresse « /icons »
 *
 * OUTIL DE DÉVELOPPEMENT, pas un écran du miroir. Il sert à deux choses :
 *   - vérifier d'un coup d'œil que les 21 icônes sont correctes et que leurs
 *     animations tournent autour du bon point ;
 *   - choisir une icône pendant l'écriture des widgets, aux tâches 6 à 8.
 *
 * Cette page n'est référencée nulle part : rien n'y mène depuis le miroir.
 * Elle peut être supprimée sans rien casser.
 *
 * Elle déroge volontairement à deux règles de globals.css — le curseur
 * réapparaît et la page défile — parce qu'elle se regarde sur un ordinateur,
 * avec une souris, et non derrière un miroir.
 * ========================================================================== */

import Book from "@/components/icons/Book";
import Briefcase from "@/components/icons/Briefcase";
import Broom from "@/components/icons/Broom";
import Cake from "@/components/icons/Cake";
import Cart from "@/components/icons/Cart";
import Confetti from "@/components/icons/Confetti";
import CookingPot from "@/components/icons/CookingPot";
import Dumbbell from "@/components/icons/Dumbbell";
import Flame from "@/components/icons/Flame";
import Heart from "@/components/icons/Heart";
import Moon from "@/components/icons/Moon";
import OpenBook from "@/components/icons/OpenBook";
import RainCloud from "@/components/icons/RainCloud";
import Smiley from "@/components/icons/Smiley";
import Sparkles from "@/components/icons/Sparkles";
import Sun from "@/components/icons/Sun";
import SunCloud from "@/components/icons/SunCloud";
import Train from "@/components/icons/Train";
import TrashBin from "@/components/icons/TrashBin";
import Umbrella from "@/components/icons/Umbrella";
import WaterDrop from "@/components/icons/WaterDrop";
import SectionLabel from "@/components/ui/SectionLabel";
import type { IconProps } from "@/components/icons/IconBase";

/* Une seule liste décrit la galerie : nom du fichier, composant, mouvement,
 * couleur d'exemple. Ajouter une icône au projet = ajouter une ligne ici. */
type GalleryEntry = {
  name: string;
  Component: (props: IconProps) => React.ReactElement;
  motion: string;
  tone: string;
};

const ANIMATED: GalleryEntry[] = [
  { name: "Sun", Component: Sun, motion: "spin", tone: "text-amber" },
  {
    name: "SunCloud",
    Component: SunCloud,
    motion: "spin + drift",
    tone: "text-cloud",
  },
  {
    name: "RainCloud",
    Component: RainCloud,
    motion: "drift + drop",
    tone: "text-cloud",
  },
  { name: "Moon", Component: Moon, motion: "bob + twinkle", tone: "text-moon" },
  {
    name: "Smiley",
    Component: Smiley,
    motion: "bob + blink",
    tone: "text-amber",
  },
  {
    name: "Umbrella",
    Component: Umbrella,
    motion: "bob + drop",
    tone: "text-amber",
  },
  {
    name: "TrashBin",
    Component: TrashBin,
    motion: "wiggle",
    tone: "text-amber",
  },
  { name: "Train", Component: Train, motion: "ride", tone: "text-cyan" },
  { name: "Flame", Component: Flame, motion: "flicker", tone: "text-coral" },
  { name: "Book", Component: Book, motion: "pop", tone: "text-magenta" },
  {
    name: "WaterDrop",
    Component: WaterDrop,
    motion: "bob",
    tone: "text-cyan",
  },
  {
    name: "Sparkles",
    Component: Sparkles,
    motion: "twinkle",
    tone: "text-neon-green",
  },
  {
    name: "CookingPot",
    Component: CookingPot,
    motion: "steam",
    tone: "text-coral",
  },
  { name: "Heart", Component: Heart, motion: "pop", tone: "text-magenta" },
  {
    name: "Confetti",
    Component: Confetti,
    motion: "confetti",
    tone: "text-ink",
  },
  {
    name: "Cart",
    Component: Cart,
    motion: "wiggle",
    tone: "text-neon-green",
  },
  { name: "Broom", Component: Broom, motion: "sway", tone: "text-cyan" },
  { name: "Cake", Component: Cake, motion: "bob + flicker", tone: "text-ink" },
];

const STATIC_ICONS: GalleryEntry[] = [
  {
    name: "Briefcase",
    Component: Briefcase,
    motion: "aucun",
    tone: "text-cyan",
  },
  {
    name: "OpenBook",
    Component: OpenBook,
    motion: "aucun",
    tone: "text-magenta",
  },
  {
    name: "Dumbbell",
    Component: Dumbbell,
    motion: "aucun",
    tone: "text-coral",
  },
];

function IconCell({ entry }: { entry: GalleryEntry }) {
  const { Component, name, motion, tone } = entry;
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink/10 p-6">
      <Component size={72} className={tone} />
      <p className="text-[18px] font-semibold text-ink">{name}</p>
      <p className="text-[15px] font-light text-muted">{motion}</p>
    </div>
  );
}

export default function IconsGalleryPage() {
  return (
    <main className="h-screen cursor-auto overflow-y-auto bg-bg p-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <SectionLabel>Icônes animées</SectionLabel>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {ANIMATED.map((entry) => (
            <IconCell key={entry.name} entry={entry} />
          ))}
        </div>

        <SectionLabel>Icônes statiques — catégories de priorités</SectionLabel>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {STATIC_ICONS.map((entry) => (
            <IconCell key={entry.name} entry={entry} />
          ))}
        </div>
      </div>
    </main>
  );
}
