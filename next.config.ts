import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Surface the package.json version to the client for the support-page
  // diagnostics. npm sets npm_package_version for every `npm run` script
  // (local dev, CI, and Vercel's build), with a safe fallback otherwise.
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? "0.0.0",
  },
  // Tree-shake the Tabler icon barrel so only used icons are bundled/compiled.
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
  },
};

export default nextConfig;
