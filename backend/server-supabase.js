const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const supabase = require("./supabase-client");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Test Supabase connection
supabase
  .from("users")
  .select("count")
  .then(() => {
    console.log("Connected to Supabase database");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Auth Routes - Using Supabase Auth
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("email, username")
      .or(`email.eq.${email},username.eq.${username}`);

    if (existingUsers && existingUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
        },
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    res.status(201).json({
      message: "User created successfully",
      userId: authData.user.id,
      emailVerification: authData.user.email_confirmed_at
        ? null
        : "Please check your email to verify your account",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      return res.status(401).json({ error: "User profile not found" });
    }

    // Create JWT token for your API
    const token = jwt.sign(
      {
        userId: profile.id,
        username: profile.username,
        firstName: profile.first_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: profile.id,
        username: profile.username,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
      },
      supabaseToken: authData.session.access_token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Questions Routes
app.get("/api/questions", async (req, res) => {
  try {
    const { data: questions, error } = await supabase
      .from("questions")
      .select(
        `
        id,
        title,
        created_at,
        users!inner(username)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Format the response to match expected structure
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      title: q.title,
      created_at: q.created_at,
      username: q.users.username,
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/questions", authenticateToken, async (req, res) => {
  try {
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
      .insert({
        title,
        description,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res
      .status(201)
      .json({ message: "Question created successfully", questionId: data.id });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/questions/:id", async (req, res) => {
  try {
    const questionId = req.params.id;

    // Get question
    const { data: questions, error: questionError } = await supabase
      .from("questions")
      .select(
        `
        id,
        title,
        description,
        created_at,
        profiles!inner(username)
      `,
      )
      .eq("id", questionId)
      .single();

    if (questionError || !questions) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Get answers
    const { data: answers, error: answerError } = await supabase
      .from("answers")
      .select(
        `
        id,
        answer,
        created_at,
        profiles!inner(username)
      `,
      )
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (answerError) {
      throw answerError;
    }

    // Format response
    const formattedQuestion = {
      id: questions.id,
      title: questions.title,
      description: questions.description,
      created_at: questions.created_at,
      username: questions.profiles.username,
    };

    const formattedAnswers = answers.map((a) => ({
      id: a.id,
      answer: a.answer,
      created_at: a.created_at,
      username: a.profiles.username,
    }));

    res.json({
      question: formattedQuestion,
      answers: formattedAnswers,
    });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Answers Routes
app.post("/api/questions/:id/answers", authenticateToken, async (req, res) => {
  try {
    const { answer } = req.body;
    const questionId = req.params.id;
    const userId = req.user.userId;

    if (!answer) {
      return res.status(400).json({ error: "Answer is required" });
    }

    // Check if question exists
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const { data, error } = await supabase
      .from("answers")
      .insert({
        answer,
        question_id: questionId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res
      .status(201)
      .json({ message: "Answer posted successfully", answerId: data.id });
  } catch (error) {
    console.error("Post answer error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
