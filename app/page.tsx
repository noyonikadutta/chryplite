"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type Post = {
  id: number;
  title: string;
  content: string | null;
  read_time: number | null;
  tags: string[] | null;
  media_urls: string[] | null;
  created_at: string;
};

const PAGE_SIZE = 12; // 3x4 grid per “page”

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const getReadTime = (post: Post) => {
    if (post.read_time && post.read_time > 0) return post.read_time;
    const words = (post.content || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200)); // fallback
  };

  const fetchPage = useCallback(
    async (pageNum: number) => {
      if (loading || !hasMore) return;
      setLoading(true);
      setError(null);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, content, tags, media_urls, read_time, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error(error);
        setError("Failed to load posts.");
        setLoading(false);
        return;
      }

      const newItems = data ?? [];
      setPosts((prev) => {
      const merged = [...prev, ...newItems];
      // Deduplicate by post.id
      const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
      return unique;
    });


      // if fewer than a full page returned, we’re at the end
      if (newItems.length < PAGE_SIZE) setHasMore(false);

      setLoading(false);
    },
    [loading, hasMore]
  );

  // first load
  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  // observe bottom sentinel for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchPage(next);
        }
      },
      { rootMargin: "200px" } // prefetch a bit before reaching bottom
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading, fetchPage]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500">
      {/* header */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 text-white">
        <h1 className="text-3xl md:text-4xl font-extrabold">For You</h1>
        <p className="opacity-90 mt-1">Fresh posts, 3×4 grid, infinite scroll.</p>
      </div>

      {/* grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <article className="group relative bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden cursor-pointer">
                {/* media thumbnail if any */}
                <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                  {post.media_urls && post.media_urls.length > 0 ? (
                    // image only as thumbnail; videos/audio will show on post page
                    post.media_urls[0].match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={post.media_urls[0]}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                        File: {post.media_urls[0].split("/").pop()}
                      </div>
                    )
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No media
                    </div>
                  )}
                </div>

                {/* content */}
                <div className="p-4">
                  <h2 className="font-semibold line-clamp-2">{post.title}</h2>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {(post.content || "").slice(0, 120)}
                    {(post.content || "").length > 120 ? "..." : ""}
                  </p>

                  {/* tags */}
                  {post.tags?.slice(0, 3).map((t) => (
                    <span
                      key={`${post.id}-${t}`} // unique key using post id + tag
                      className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700"
                    >
                      #{t}
                    </span>
                  ))}
                    </div>
                

                {/* min-read badge */}
                <span className="absolute top-3 right-3 text-xs font-medium bg-black/70 text-white px-2 py-1 rounded-full">
                  {getReadTime(post)} min read
                </span>
              </article>
            </Link>
          ))}

          {/* skeletons while loading (first page especially) */}
          {loading && posts.length === 0 &&
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="animate-pulse bg-white/60 rounded-2xl h-64"
              />
            ))}
        </div>

        {/* loading / end / error states */}
        <div className="mt-6 text-center text-white/90">
          {loading && posts.length > 0 && <p>Loading more…</p>}
          {!hasMore && posts.length > 0 && <p>That’s all for now ✨</p>}
          {error && <p className="text-red-100">{error}</p>}
        </div>

        {/* sentinel: must be present for the observer */}
        <div ref={sentinelRef} className="h-1" />
      </section>
    </main>
  );
}
