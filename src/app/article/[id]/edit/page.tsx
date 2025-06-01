"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ArticleForm, { ArticleFormData } from "@/components/ArticleForm";
import { withAuth } from "@/libs/withAuth";
import { useAuth } from "@/libs/AuthContext";
import Header from "@/components/Header";
import ArticleDeleteButton from "@/components/ArticleDelete";
import { supabase } from "../../../../libs/supabase";
import { uploadImageToSupabase } from "../../../../libs/uploadImageToSupabase";

// 記事編集ページのコンポーネント
export default withAuth(function EditArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id: articleId } = useParams() as { id: string };
  const [article, setArticle] = useState<ArticleFormData | null>(null);
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // カテゴリデータの取得
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("id");

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (err) {
        console.error("カテゴリデータの取得エラー:", err);
      }
    }

    fetchCategories();
  }, []);

  // 記事データの取得
  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", Number(articleId))
          .single(); // 1件だけ取得

        if (error) {
          throw error;
        }

        if (data.user_id !== user?.id) {
          setError("この投稿を編集する権限がありません。");
          return;
        }

        const fetchedArticle: ArticleFormData = {
          title: data.title,
          content: data.content,
          category_id: data.category_id,
          image: null,
          image_path: data.image_path || "",
          user_id: data.user_id,
        };

        setArticle(fetchedArticle);
      } catch (err) {
        console.error("記事データの取得エラー:", err);
        setError("記事データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    }

    if (articleId && user) {
      fetchArticle();
    }
  }, [articleId, user]);

  //※記事投稿に合わせる
  function getJSTDate(): Date {
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    return new Date(now.getTime() + jstOffset);
  }

  // 更新処理
  const handleSubmit = async (data: ArticleFormData) => {
    try {
      let imagePath = data.image_path;
      if (data.image) {
        const uploadedUrl = await uploadImageToSupabase(data.image);
        if (!uploadedUrl) {
          alert("画像のアップロードに失敗しました");
          return;
        }
        imagePath = uploadedUrl;
      }

      // 更新データ
      const updateData = {
        title: data.title,
        content: data.content,
        category_id: data.category_id,
        image_path: imagePath,
        updated_at: getJSTDate(),
      };

      const { error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", Number(articleId));

      if (error) {
        throw error;
      }

      console.log("送信する更新データ:", updateData);

      // 成功時のリダイレクト
      router.push(`/article/${articleId}`);
    } catch (err) {
      console.error("記事更新エラー:", err);
      alert("記事の更新に失敗しました。");
    }
  };

  return (
    <>
      <Header />

      <div className="max-w-4xl mx-auto p-4">
        {loading && <p className="text-center py-8">読み込み中...</p>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && article && (
          <ArticleForm
            onSubmit={handleSubmit}
            initialData={article}
            categories={categories}
            deleteButton={
              <ArticleDeleteButton
                articleId={articleId}
                ownerId={article.user_id ?? ""}
                currentUserId={user?.id}
              />
            }
          />
        )}
      </div>
    </>
  );
});
