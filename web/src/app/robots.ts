import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api", "/souscrire", "/verify-email", "/reset-password"],
    },
    sitemap: "https://declarerdefibrillateur.fr/sitemap.xml",
  };
}
