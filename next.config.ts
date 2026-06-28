import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // pdfkit lit ses polices .afm via fs : ne pas le bundler côté serveur.
  serverExternalPackages: ["pdfkit"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
