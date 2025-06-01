import React from "react";
import ArticleDetail from "@/components/ArticleDetail";
import { supabase } from "@/libs/supabase";

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;

  const postId = Number(id);

  const { data: post, error } = await supabase
    .from("posts")
    .select("*, category:categories(name)")
    .eq("id", postId)
    .single();

  if (error || !post) {
    return <main>記事が見つかりませんでした。</main>;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, image_path")
    .eq("id", post.user_id)
    .single();

  if (userError || !user) {
    return <main>ユーザー情報が見つかりませんでした。</main>;
  }

  const postWithUser = {
    ...post,
    user,
    category: post.category,
  };

  return (
    <>
      <ArticleDetail post={postWithUser} />
    </>
  );
}
