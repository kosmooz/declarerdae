"use client";

import { useParams } from "next/navigation";
import BlogEditor from "@/components/admin/blog/BlogEditor";

export default function AdminEditArticlePage() {
  const params = useParams();
  return <BlogEditor articleId={params.id as string} />;
}
