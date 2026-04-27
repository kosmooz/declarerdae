import type { MetadataRoute } from "next";

const BASE = "https://declarerdefibrillateur.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), priority: 1.0, changeFrequency: "monthly" },
    { url: `${BASE}/declaration`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${BASE}/tarifs`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/obligations`, priority: 0.8, changeFrequency: "yearly" },
    { url: `${BASE}/guide-erp`, priority: 0.7, changeFrequency: "yearly" },
    { url: `${BASE}/a-propos`, priority: 0.5, changeFrequency: "yearly" },
    { url: `${BASE}/contact`, priority: 0.5, changeFrequency: "yearly" },
    { url: `${BASE}/blog`, priority: 0.6, changeFrequency: "weekly" },
    { url: `${BASE}/mentions-legales`, priority: 0.2, changeFrequency: "yearly" },
    { url: `${BASE}/politique-de-confidentialite`, priority: 0.2, changeFrequency: "yearly" },
  ];
}
