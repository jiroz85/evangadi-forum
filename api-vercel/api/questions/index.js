const supabase = require("../../utils/supabase");
const { authenticateToken } = require("../../utils/auth");
const cors = require("../../utils/cors");

module.exports = async (req, res) => {
  cors(req, res, () => {});

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method === "GET") {
      const { data: questions, error } = await supabase
        .from("questions")
        .select("id, title, created_at, users(username)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedQuestions = questions.map((q) => ({
        id: q.id,
        title: q.title,
        created_at: q.created_at,
        username: q.users.username,
      }));

      res.json(formattedQuestions);
    } else if (req.method === "POST") {
      authenticateToken(req, res, async () => {
        const { title, description } = req.body;
        const userId = req.user.userId;

        if (!title || !description) {
          return res
            .status(400)
            .json({ error: "Title and description are required" });
        }

        if (title.length > 200) {
          return res
            .status(400)
            .json({ error: "Title must be 200 characters or less" });
        }

        const { data, error } = await supabase
          .from("questions")
          .insert([
            {
              title: title,
              description: description,
              user_id: userId,
            },
          ])
          .select();

        if (error) throw error;

        res
          .status(201)
          .json({
            message: "Question created successfully",
            questionId: data[0].id,
          });
      });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Questions error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
