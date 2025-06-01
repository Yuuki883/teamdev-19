"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/libs/supabase";
import Header from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import PostCard from "@/components/PostCard";

/**
 * 記事データの型定義
 */
interface Post {
  id: number;
  title: string;
  content: string;
  image_path?: string;
  created_at: string;
  user_id?: string;
  category_id?: number;
  categories?: { name: string };
}

/**
 * 検索結果を表示するコンポーネント（Suspense内で実行）
 */
function SearchResults() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function searchPosts() {
      if (!keyword) {
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Supabaseでタイトルに検索キーワードを含む記事を検索
        const { data, error } = await supabase
          .from("posts")
          .select("*, categories(name)")
          .ilike("title", `%${keyword}%`);

        if (error) throw error;

        setPosts(data || []);
      } catch (err: unknown) {
        console.error("検索エラー:", err);
        setError(
          err instanceof Error ? err.message : "検索中にエラーが発生しました",
        );
      } finally {
        setLoading(false);
      }
    }

    searchPosts();
  }, [keyword]);

  return (
    <div className="mt-8">
      <h1 className="text-2xl font-bold mb-4">
        「{keyword}」の検索結果: {posts.length}件
      </h1>

      {loading && (
        <div className="text-center py-10">
          <p>検索中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-10">
          <p>「{keyword}」に一致する記事が見つかりませんでした。</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post_id={post.id.toString()}
            category_id={post.category_id?.toString() || ""}
            title={post.title}
            content={post.content}
            image_path={post.image_path || ""}
            created_at={post.created_at}
            categoryName={post.categories?.name}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 検索結果表示ページ
 * URLのクエリパラメータからキーワードを取得し、記事を検索して表示
 */
export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto p-4">
        <SearchBar />

        <Suspense fallback={<div className="text-center py-10">検索中...</div>}>
          <SearchResults />
        </Suspense>
      </main>
    </>
  );
}
