/* ==========================================================================
 * app/mirror/page.tsx — l'écran du miroir, à l'adresse « /mirror »
 *
 * ATTENTION : ce fichier est provisoire. Il n'existe sous cette forme que pour
 * que la tâche 1 soit vérifiable à l'œil (l'adresse répond, le fond est noir,
 * la police est la bonne). Il sera remplacé par les tâches suivantes :
 *
 *   tâche 2 : le contenu est enfermé dans <MirrorFrame>, un cadre de
 *             1080 × 1920 px mis à l'échelle pour tenir dans la fenêtre ;
 *   tâche 3 : plus rien n'est écrit en dur ici. La page calcule le mode
 *             (matin / soir / week-end), lit la liste des widgets de ce mode
 *             dans config/layouts.json, et demande au registre le composant
 *             correspondant à chaque entrée.
 *
 * Autrement dit, l'objectif est que cette page ne connaisse JAMAIS un widget
 * en particulier : elle ne fait que suivre la configuration. C'est ce qui
 * permettra, à l'étape 4, de changer l'écran depuis une appli téléphone sans
 * toucher au code.
 * ========================================================================== */

export default function MirrorPage() {
  /* Un composant React renvoie du JSX : du balisage qui ressemble à du HTML,
   * écrit à l'intérieur du JavaScript.
   *
   * Les mots dans className= sont des classes Tailwind. Celles qui portent un
   * nom de jeton viennent du bloc @theme de globals.css :
   *
   *   bg-bg       -> fond = --color-bg    (noir)
   *   text-label  -> texte = --color-label (gris clair des petits titres)
   *
   * Les autres sont des utilitaires de mise en page de Tailwind :
   *
   *   h-screen w-screen        -> occupe toute la hauteur et la largeur
   *   flex items-center        -> centre verticalement
   *   justify-center           -> centre horizontalement
   *   text-[22px]              -> taille exacte en pixels
   *   tracking-[3px]           -> espacement entre les lettres
   *   uppercase font-semibold  -> majuscules, graisse 600
   *
   * h-screen / w-screen disparaîtront à la tâche 2 : c'est MirrorFrame qui
   * imposera la taille fixe de 1080 × 1920 px.
   *
   * Les quatre dernières classes reproduisent exactement le style « petit
   * titre de section » du brief (22 px, majuscules, espacement 3 px,
   * graisse 600). Cette répétition est volontairement temporaire : la tâche 2
   * crée le composant <SectionLabel>, et ce style ne sera plus écrit qu'une
   * seule fois, dans ce composant. C'est le principe à retenir — dès qu'un
   * style ou un bout de balisage apparaît deux fois, il devient un composant. */
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-bg">
      <p className="text-[22px] font-semibold tracking-[3px] text-label uppercase">
        Écran du miroir
      </p>
    </main>
  );
}
