const supabase = require("../../../_utils/supabase");
const { authenticateToken } = require("../../../_utils/auth");
const cors = require("../../../_utils/cors");

module.exports = async (req, res) => {
  cors(req, res, () => {});

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticateToken(req, res, async () => {
    try {
      const { answer } = req.body;
      const questionId = req.query.id;
      const userId = req.user.userId;

      if (!answer) {
        return res.status(400).json({ error: "Answer is required" });
      }

      const { data: questions, error: questionError } = await supabase
        .from("questions")
        .select("id")
        .eq("id", questionId)
        .single();

      if (questionError || !questions) {
        return res.status(404).json({ error: "Question not found" });
      }

      const { data, error } = await supabase
        .from("answers")
        .insert([
          {
            answer: answer,
            question_id: questionId,
            user_id: userId,
          },
        ])
        .select();

      if (error) throw error;

      res
        .status(201)
        .json({ message: "Answer posted successfully", answerId: data[0].id });
    } catch (error) {
      console.error("Post answer error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
};
