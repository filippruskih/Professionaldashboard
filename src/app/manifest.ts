import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Creator Dashboard",
    short_name: "Dashboard",
    description: "Personal Instagram Reels analytics & content agents",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0f10",
    theme_color: "#574ede",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
