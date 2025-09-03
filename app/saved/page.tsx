async function savePost(postId: number) {
  const { error } = await supabase.from("saved_posts").insert([
    { user_id: "demo-user", post_id: postId } // replace with real auth later
  ]);
  if (error) console.error(error);
  else alert("Post saved!");
}
