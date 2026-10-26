/* ==========================================================================
 * app/page.tsx — la page d'accueil, c'est-à-dire l'adresse « / »
 *
 * Dans l'App Router de Next.js, l'adresse d'une page est donnée par le chemin
 * du dossier qui contient son fichier page.tsx :
 *
 *   app/page.tsx         ->  /
 *   app/mirror/page.tsx  ->  /mirror
 *
 * Le miroir n'a qu'un seul écran, qui vit sur /mirror. Cette page ne sert donc
 * qu'à rediriger : quelqu'un qui ouvre la racine arrive directement au bon
 * endroit, sans avoir à taper l'adresse complète.
 * ========================================================================== */

import { redirect } from "next/navigation";

export default function Home() {
  /* redirect() interrompt immédiatement le rendu de la page : le navigateur
   * reçoit une réponse « va plutôt à /mirror » (un code HTTP 307) et rien de
   * ce qui suit n'est exécuté. C'est pour cela que cette fonction ne renvoie
   * aucun JSX, contrairement à toutes les autres pages du projet. */
  redirect("/mirror");
}
