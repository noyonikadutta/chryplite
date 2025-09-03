"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const router = useRouter();

  async function createPost() {
    if (!title || !content) return alert("Fill all fields!");

    let uploadedUrls: string[] = [];

    if (files) {
      for (const file of Array.from(files)) {
        const { data, error } = await supabase.storage
          .from("media")
          .upload(`${Date.now()}-${file.name}`, file);

        if (error) {
          console.error("Upload error:", error);
        } else {
          const { data: urlData } = supabase.storage
            .from("media")
            .getPublicUrl(`${data?.path}`);
          uploadedUrls.push(urlData.publicUrl);
        }
      }
    }

    const { error } = await supabase.from("posts").insert([
      {
        title,
        content,
        media_urls: uploadedUrls,
        read_time: Math.ceil(content.split(" ").length / 200),
        tags: [],
      },
    ]);

    if (error) {
      alert("Error creating post!");
    } else {
      router.push("/");
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="mb-4"
      />

      <button
        onClick={createPost}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </main>
  );
}
