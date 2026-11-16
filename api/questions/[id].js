const supabase = require("../utils/supabase");
const cors = require("../utils/cors");

module.exports = async (req, res) => {
  cors(req, res, () => {});

  // The shared CORS middleware has already completed the preflight response.
  if (req.method === "OPTIONS") {
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const questionId = req.query?.id;
    if (!questionId) {
      return res.status(400).json({ error: "Question ID is required" });
    }

    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id, title, description, created_at, users(username)")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const { data: answers, error: answersError } = await supabase
      .from("answers")
      .select("id, answer, created_at, users(username)")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (answersError) throw answersError;

    return res.status(200).json({
      question: {
        id: question.id,
        title: question.title,
        description: question.description,
        created_at: question.created_at,
        username: question.users?.username ?? null,
      },
      answers: answers.map((answer) => ({
        id: answer.id,
        answer: answer.answer,
        created_at: answer.created_at,
        username: answer.users?.username ?? null,
      })),
    });
  } catch (error) {
    console.error("Get question error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
