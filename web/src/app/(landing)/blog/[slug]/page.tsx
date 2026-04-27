import type { Metadata } from "next";
import BlogArticleClient from "./BlogArticleClient";

export const metadata: Metadata = {
  title: "Article — Blog DéclarerDéfibrillateur.fr",
  description:
    "Article du blog DéclarerDéfibrillateur.fr sur les défibrillateurs automatisés externes et la réglementation.",
  alternates: { canonical: "/blog" },
};

export default function BlogArticlePage() {
  return <BlogArticleClient />;
}
