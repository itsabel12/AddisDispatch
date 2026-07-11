import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://addisdispatch.com";

// Public, indexable marketing routes only. The /admin and /carrier portals are
// auth-gated and intentionally excluded (see robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/apply`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
