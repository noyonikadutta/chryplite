let feedbacks = []; // temporary in-memory storage

export default function handler(req, res) {
  if (req.method === "POST") {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required" });
    }

    const newFeedback = {
      id: Date.now(),
      name,
      message,
    };

    feedbacks.push(newFeedback);
    console.log("📩 New Feedback:", newFeedback);

    return res.status(200).json({ success: true, msg: "Feedback received!" });
  }

  if (req.method === "GET") {
    return res.status(200).json(feedbacks);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
