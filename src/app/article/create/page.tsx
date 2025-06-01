"use client";

import React, { useState, useEffect } from "react";
import ArticleForm, { ArticleFormData } from "@/components/ArticleForm";
import { useRouter } from "next/navigation";
import { supabase } from "@/libs/supabase";
import { v4 as uuidv4 } from "uuid";
import { withAuth } from "@/libs/withAuth";
import { useAuth } from "@/libs/AuthContext";
import Header from "@/components/Header";

export default withAuth(function CreateArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);

  // カテゴリ一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("カテゴリ取得エラー:", error);
        setCategories([]);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);
  const { user } = useAuth();

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
      console.warn("画像ファイルが指定されていません");
      return null;
    }

    console.log("アップロードするファイル:", file);

    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = `posts/${uniqueFileName}`; // 正しい仮想ディレクトリパス

    console.log("アップロード先ファイルパス:", filePath);

    const { error: uploadError } = await supabase.storage
      .from("my-bucket")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("画像アップロードエラー:", uploadError);
      return null;
    }

    const { data: listData, error: listError } = await supabase.storage
      .from("my-bucket")
      .list("posts", {
        search: uniqueFileName,
      });

    if (listError) {
      console.error("アップロード確認用リスト取得エラー:", listError);
    } else {
      console.log("アップロード後のファイル一覧:", listData);
    }

    const { data: publicUrlData } = supabase.storage
      .from("my-bucket")
      .getPublicUrl(filePath);

    console.log("getPublicUrlの戻り値:", publicUrlData);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.warn("publicUrlが取得できませんでした。data内容:", publicUrlData);
      return null;
    }

    console.log("取得した画像のURL:", publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (formData: ArticleFormData) => {
    if (!formData.image) {
      alert("画像が選択されていません！");
      return;
    }

    console.log("選択された画像ファイル:", formData.image);

    try {
      const imagePath = await uploadImage(formData.image);
      console.log("アップロードされた画像URL:", imagePath);

      const postPayload: {
        title: string;
        content: string;
        category_id: number;
        user_id?: string;
        user_email?: string;
        user_avatar?: string | null;
        image_path?: string;
      } = {
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id,
        user_id: user?.id,
        user_email: user?.email,
        user_avatar: user?.user_metadata?.avatar_url || null,
      };

      if (imagePath) {
        postPayload.image_path = imagePath;
      }

      const { data: insertedData, error } = await supabase
        .from("posts")
        .insert([postPayload])
        .select();

      if (error) throw error;

      const postId = insertedData?.[0]?.id;
      if (postId) {
        router.push(`/article/${postId}`);
      } else {
        alert("記事IDの取得に失敗しました");
      }
    } catch (error) {
      console.error("投稿エラー:", error);
      alert("投稿に失敗しました");
    }
  };

  return (
    <div>
      <Header />
      <ArticleForm onSubmit={handleSubmit} categories={categories} />
    </div>
  );
});
