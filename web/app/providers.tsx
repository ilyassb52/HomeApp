/* ==========================================================================
 * app/providers.tsx — ce que toutes les pages partagent côté navigateur
 *
 * Pour l'instant, une seule chose : le cache de TanStack Query. Posé ici,
 * dans layout.tsx, il sert au miroir comme à la future page téléphone.
 * ========================================================================== */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  /* Le cache est créé dans un useState, et non au niveau du fichier : sur le
   * serveur, un cache partagé mélangerait les données de requêtes
   * différentes. useState en crée un par affichage, et le garde ensuite. */
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
