/** @jsxImportSource react */
"use client";
import Image from "next/image";
import { CommentSection } from "./CommentSection";
import Header from "./Header";

type User = {
  id: number;
  name: string;
  image_path: string | null;
};

type Category = {
  id: number;
  name: string;
};

type PostWithUser = {
  id: number;
  title: string;
  content: string;
  image_path: string | null;
  created_at: string;
  updated_at: string;
  category: Category;
  user_id: number;
  user: User;
};

export default function ArticleDetail({ post }: { post: PostWithUser }) {
  return (
    <>
      <Header />
      {/* 詳細記事本体 */}
      <div className="max-w-4xl mx-auto p-5">
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <div className="flex items-center">
              {post.user?.image_path ? (
                <Image
                  src={post.user.image_path}
                  alt="ユーザーアイコン"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300" />
              )}
            </div>
          </div>

          <div className="mb-6">
            {post.image_path ? (
              <Image
                src={post.image_path}
                alt={post.title}
                width={600}
                height={400}
                className="rounded object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-64 bg-gray-300"></div>
            )}
          </div>

          <div className="text-base leading-relaxed">
            <div className="flex gap-4 text-sm text-gray-600  mb-3">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                カテゴリ: {post.category?.name}
              </span>
              <span className="text-xs">
                投稿日時: {new Date(post.created_at).toLocaleString()}
              </span>
            </div>
            <p>{post.content}</p>
          </div>
        </div>
        <CommentSection postId={post.id} />
      </div>
    </>
  );
}
