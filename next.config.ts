import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tree-shake the Tabler icon barrel so only used icons are bundled/compiled.
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
  },
};

export default nextConfig;
