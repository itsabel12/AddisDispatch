import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://addisdispatch.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep the auth-gated portal trees out of the index. The trailing "/"
        // is important: a bare "/carrier" is a prefix rule that would ALSO
        // block the public "/carrier-agreement" legal page from being crawled.
        disallow: ["/admin/", "/carrier/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
