import type { NextConfig } from "next";

/* L'adresse de l'API FastAPI, vue depuis le serveur Next.js. Par défaut, celle
 * de Docker Compose en local ; API_URL permet de la changer sans toucher au
 * code (voir .env.example). */
const API_URL = process.env.API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,

  /* LE PROXY « /backend »
   *
   * Le navigateur (miroir ou téléphone) ne parle qu'à Next.js : une requête
   * vers /backend/goals est relayée en coulisse vers API_URL/goals. Le
   * navigateur ne connaît donc jamais l'adresse de l'API, et comme tout part
   * de la même origine, aucun réglage CORS n'est nécessaire côté FastAPI. */
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${API_URL}/:path*`,
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
