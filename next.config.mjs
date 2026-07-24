import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "http-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
        networkTimeoutSeconds: 10
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: []
  }
};

export default withPWA(nextConfig);
