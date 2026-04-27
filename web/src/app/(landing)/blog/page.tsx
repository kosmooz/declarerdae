import type { Metadata } from "next";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "Blog — Actualités défibrillateurs et réglementation DAE",
  description:
    "Articles et guides sur les défibrillateurs automatisés externes : réglementation, maintenance, obligations légales et bonnes pratiques.",
  alternates: { canonical: "/blog" },
};

export default function BlogListingPage() {
  return <BlogListClient />;
}
