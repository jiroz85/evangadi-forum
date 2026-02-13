const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../utils/supabase");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const { data: users, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, username, email, password")
      .eq("email", email)
      .single();

    if (error || !users) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, users.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: users.id,
        username: users.username,
        firstName: users.first_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: users.id,
        username: users.username,
        firstName: users.first_name,
        lastName: users.last_name,
        email: users.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
