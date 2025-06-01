"use client";

import React, { useState, useRef, useEffect } from "react";

// 記事フォームで扱うデータの型定義
export interface ArticleFormData {
  title: string;
  content: string;
  category_id: number;
  image: File | null;
  image_path?: string;
  user_id?: string;
}

interface ArticleFormProps {
  onSubmit: (formData: ArticleFormData) => void;
  initialData?: ArticleFormData;
  categories: Array<{ id: number; name: string }>;
  deleteButton?: React.ReactNode;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  onSubmit,
  initialData,
  categories,
  deleteButton,
}) => {
  // フォームの状態を初期化
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    category_id: 0,
    image: null,
  });

  // 画像アップロード部分の状態はformData.imageで管理するため、imagePreviewのみ保持
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初期データの適用
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.image_path) setImagePreview(initialData.image_path);
    }
  }, [initialData]);

  // 入力値の変更処理
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    // カテゴリーIDは数値に変換
    if (name === "category_id") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      // その他の入力はそのまま
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 画像選択処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file, image_path: undefined }));

      // 画像ファイルをブラウザで表示できる形式に変換してプレビューに使用
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // フォーム送信ボタンがクリックされたときに実行される関数
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ページのリロードを防止

    if (!formData.image) {
      alert("画像が選択されていません！");
      return;
    }

    console.log("選択された画像ファイル:", formData.image);

    onSubmit(formData); // 入力データを親コンポーネントに渡す
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <form onSubmit={handleSubmit}>
        {/* タイトル入力部分 */}
        <div className="mb-8">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="ブログタイトルを入力"
            className="text-4xl font-bold border-none outline-none w-full"
            required
          />
          {/* タイトル下の区切り線 */}
          <div className="h-0.5 w-full bg-gray-100 mt-2"></div>
        </div>

        {/* 画像アップロード部分 */}
        <div className="mb-8">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer ${imagePreview ? "" : "hover:bg-gray-50"}`}
            style={
              imagePreview
                ? {
                    backgroundImage: `url(${imagePreview})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          >
            {/* 画像がない場合のみ、アップロードアイコンとボタンを表示 */}
            {!imagePreview && (
              <>
                {/* 上向き矢印のSVGアイコン */}
                <svg
                  className="w-12 h-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  ></path>
                </svg>
                {/* アップロードボタン */}
                <button
                  type="button"
                  className="bg-blue-500 text-white px-6 py-2 rounded-full"
                >
                  Upload Image
                </button>
              </>
            )}
            {/* 実際のファイル入力要素（非表示） */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* カテゴリ選択部分 */}
        <div className="mb-8 flex justify-end items-center">
          <label className="text-gray-600 mr-2">Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 bg-white"
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 記事内容入力部分 */}
        <div className="mb-8">
          <div className="bg-gray-100 rounded-lg p-6">
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your article content here..."
              className="w-full bg-transparent border-none outline-none resize-none min-h-[150px]"
              required
            />
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4">
          {deleteButton}
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
