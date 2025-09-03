"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const words = content.trim().split(/\s+/).length;
    const read_time = Math.ceil(words / 200); // ~200 words/minute

    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()),
        word_count: words,
        read_time,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("❌ Failed to add post");
    } else {
      setMessage("✅ Post added successfully!");
      setTitle("");
      setContent("");
      setTags("");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-pink-500 p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <form onSubmit={handleSubmit} className="bg-white text-black p-6 rounded-xl w-full max-w-md shadow-lg">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          rows={5}
          required
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
          Add Post
        </button>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </form>
    </main>
  );
}
