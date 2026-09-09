import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ffmpeg-installer/ffmpeg resolves its platform-specific binary at
  // runtime via a dynamic `require(computedPath)` (picking between several
  // candidate node_modules layouts). Turbopack's static bundler tries to
  // eagerly resolve every branch of that at build time and fails on
  // whichever ones don't literally exist on the build machine — excluding
  // it here makes Turbopack leave it as a native Node.js require instead,
  // which resolves correctly at actual runtime.
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
  experimental: {
    // Next buffers the whole request body in memory when proxy.ts is
    // active (it is here, for the session-cookie gate), capped at 10MB by
    // default — silently truncating anything larger instead of erroring.
    // Draft-reel uploads in src/app/api/drafts/route.ts blow past that, so
    // this needs to at least match MAX_UPLOAD_BYTES there (300MB).
    proxyClientMaxBodySize: "300mb",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Never cache the service worker file itself — browsers should
        // always fetch the latest version so updates propagate promptly.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
