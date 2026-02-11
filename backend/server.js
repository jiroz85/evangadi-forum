const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, username, email, hashedPassword]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT id, first_name, last_name, username, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, firstName: user.first_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Questions Routes
app.get('/api/questions', async (req, res) => {
  try {
    const [questions] = await db.execute(`
      SELECT q.id, q.title, q.created_at, u.username 
      FROM questions q 
      JOIN users u ON q.user_id = u.id 
      ORDER BY q.created_at DESC
    `);
    
    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    const [result] = await db.execute(
      'INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, userId]
    );

    res.status(201).json({ message: 'Question created successfully', questionId: result.insertId });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const questionId = req.params.id;

    const [questions] = await db.execute(`
      SELECT q.id, q.title, q.description, q.created_at, u.username 
      FROM questions q 
      JOIN users u ON q.user_id = u.id 
      WHERE q.id = ?
    `, [questionId]);

    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const [answers] = await db.execute(`
      SELECT a.id, a.answer, a.created_at, u.username 
      FROM answers a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.question_id = ? 
      ORDER BY a.created_at ASC
    `, [questionId]);

    res.json({
      question: questions[0],
      answers
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Answers Routes
app.post('/api/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const { answer } = req.body;
    const questionId = req.params.id;
    const userId = req.user.userId;

    if (!answer) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    // Check if question exists
    const [questions] = await db.execute('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const [result] = await db.execute(
      'INSERT INTO answers (answer, question_id, user_id) VALUES (?, ?, ?)',
      [answer, questionId, userId]
    );

    res.status(201).json({ message: 'Answer posted successfully', answerId: result.insertId });
  } catch (error) {
    console.error('Post answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
