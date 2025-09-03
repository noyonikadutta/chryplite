"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type Post = {
  id: number;
  title: string;
  content: string | null;
  tags: string[] | null;
  media_urls: string[] | null;
  created_at: string;
};

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setError("Failed to load post.");
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    if (id) fetchPost();
  }, [id]);

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;
  if (!post) return <p className="p-8 text-center">Post not found</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-6">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-gray-500 text-sm mt-1">
        {new Date(post.created_at).toLocaleString()}
      </p>

      {/* Media Section */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="mt-4 space-y-4">
          {post.media_urls.map((url, i) => {
            if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              return (
                <img
                  key={i}
                  src={url}
                  alt={`Media ${i}`}
                  className="rounded-lg shadow"
                />
              );
            } else if (url.match(/\.(mp4|webm|mov)$/i)) {
              return (
                <video
                  key={i}
                  controls
                  className="w-full rounded-lg shadow"
                >
                  <source src={url} />
                </video>
              );
            } else if (url.match(/\.(mp3|wav)$/i)) {
              return (
                <audio key={i} controls className="w-full">
                  <source src={url} />
                </audio>
              );
            } else {
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 underline"
                >
                  Download {url.split("/").pop()}
                </a>
              );
            }
          })}
        </div>
      )}

      {/* Content */}
      <p className="mt-6 text-gray-800 leading-relaxed whitespace-pre-line">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </main>
  );
}
