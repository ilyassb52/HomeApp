/* ==========================================================================
 * app/layout.tsx — l'enveloppe commune à toutes les pages
 *
 * Dans Next.js (App Router), ce fichier est spécial : c'est lui qui écrit les
 * balises <html> et <body>. Toute page affichée (/ ou /mirror) est insérée à
 * l'intérieur, à l'endroit du { children }. Donc tout ce qui doit valoir pour
 * l'écran entier — la police, la langue, le fond — se décide ici, une fois.
 *
 * Ce fichier ne contient volontairement aucun élément visible : pas de titre,
 * pas de widget. Ce sont les pages qui affichent quelque chose.
 * ========================================================================== */

import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

/* --------------------------------------------------------------------------
 * 1. La police — section 2 du brief
 *
 * next/font/google ne met PAS de lien vers Google au moment de l'affichage :
 * au moment du build, Next télécharge la police et la sert depuis notre
 * propre site. L'écran du miroir n'a donc pas besoin d'Internet pour
 * s'afficher correctement, et la police ne « saute » pas au chargement.
 *
 * weight : on ne charge que les trois graisses utilisées par le brief.
 *   200 = très fin  (l'heure, la température)
 *   300 = léger     (le texte des listes)
 *   600 = semi-gras (les titres, les valeurs mises en avant)
 * Charger les autres graisses alourdirait la page pour rien.
 *
 * variable : au lieu de nous donner une classe, Next fabrique une variable
 * CSS nommée --font-outfit. On la pose sur <html> plus bas, et globals.css
 * la récupère pour en faire la police par défaut. Ce détour est ce qui permet
 * à Tailwind et à la police de se parler.
 * -------------------------------------------------------------------------- */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"], // seuls les caractères latins : fichier plus léger
  weight: ["200", "300", "600"],
  display: "swap", // affiche le texte tout de suite, sans attendre la police
});

/* --------------------------------------------------------------------------
 * 2. Métadonnées
 *
 * metadata alimente l'onglet du navigateur. Personne ne verra d'onglet sur le
 * miroir, mais c'est utile quand on teste sur un ordinateur.
 * viewport.themeColor indique au navigateur la couleur de ses propres bords
 * (barres système sur mobile) : noir, pour ne pas trahir le miroir.
 * -------------------------------------------------------------------------- */
export const metadata: Metadata = {
  title: "Magic Mirror",
  description: "Écran du miroir du foyer",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

/* --------------------------------------------------------------------------
 * 3. L'enveloppe elle-même
 *
 * LayoutProps<"/"> est un type que Next.js génère tout seul à partir de
 * l'arborescence des dossiers : il garantit que { children } correspond bien
 * aux pages réellement présentes. On ne l'écrit pas à la main, on l'utilise.
 *
 * lang="fr" : tous les textes affichés sont en français (règle 3 du brief).
 * Cela sert aussi aux lecteurs d'écran et à la coupure des mots.
 *
 * outfit.variable : la classe fournie par Next qui installe --font-outfit.
 * antialiased : lisse le rendu du texte, plus agréable en très grande taille.
 *
 * Le fond noir n'est PAS écrit ici : il est dans globals.css, parce qu'il
 * concerne la page entière et non ce composant. Un seul endroit par décision.
 * -------------------------------------------------------------------------- */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${outfit.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
