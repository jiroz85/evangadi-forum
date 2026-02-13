require("dotenv").config();
const express = require("express");
const supabase = require("./supabase-client");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://evangadi-forum-frontend.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));
app.use(express.json());

// Database connection via Supabase
console.log("Using Supabase database");

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

// Auth Routes
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
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("id")
      .or(`email.eq.${email},username.eq.${username}`);

    if (checkError) {
      console.error("Supabase check error:", checkError);
      throw checkError;
    }

    if (existingUsers && existingUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: result, error } = await supabase
      .from("users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password: hashedPassword,
      })
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    res
      .status(201)
      .json({ message: "User created successfully", userId: result[0].id });
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

    // Find user
    const { data: users, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, username, email, password")
      .eq("email", email);

    if (error) throw error;

    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, firstName: user.first_name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
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
      .select("id, title, created_at, user:users(username)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format response to match previous structure
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      title: q.title,
      created_at: q.created_at,
      username: q.user?.username,
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

    const { data: result, error } = await supabase
      .from("questions")
      .insert({ title, description, user_id: userId })
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Question created successfully",
      questionId: result[0].id,
    });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/questions/:id", async (req, res) => {
  try {
    const questionId = req.params.id;

    const { data: questions, error: questionError } = await supabase
      .from("questions")
      .select("id, title, description, created_at, user:users(username)")
      .eq("id", questionId);

    if (questionError) throw questionError;

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const { data: answers, error: answerError } = await supabase
      .from("answers")
      .select("id, answer, created_at, user:users(username)")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (answerError) throw answerError;

    const formattedQuestion = {
      id: questions[0].id,
      title: questions[0].title,
      description: questions[0].description,
      created_at: questions[0].created_at,
      username: questions[0].user?.username,
    };

    const formattedAnswers = answers.map((a) => ({
      id: a.id,
      answer: a.answer,
      created_at: a.created_at,
      username: a.user?.username,
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
    const { data: questions, error: questionError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", questionId);

    if (questionError) throw questionError;

    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const { data: result, error } = await supabase
      .from("answers")
      .insert({ answer, question_id: questionId, user_id: userId })
      .select();

    if (error) throw error;

    res
      .status(201)
      .json({ message: "Answer posted successfully", answerId: result[0].id });
  } catch (error) {
    console.error("Post answer error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
