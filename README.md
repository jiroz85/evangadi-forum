# Evangadi Forum - Q&A Platform

A full-stack Q&A platform built for Evangadi students to ask and answer programming-related questions.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: React.js
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS with responsive design

## Features

- User registration and login with validation
- Password requirements (minimum 8 characters)
- Unique email and username validation
- Post questions with title (200 char limit) and description
- View questions ordered by newest first
- Answer questions with real-time updates
- Responsive design for mobile and desktop
- Protected routes (authentication required)

## Project Structure

```
evangadi forum/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── database.sql
│   └── .env
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── index.css
│       ├── App.js
│       └── components/
│           ├── Navbar.js
│           ├── Login.js
│           ├── Signup.js
│           ├── Questions.js
│           ├── QuestionDetail.js
│           └── AskQuestion.js
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL server running
- XAMPP (if using Windows)

### 1. Database Setup

1. Start your MySQL server (via XAMPP or directly)
2. Import the database schema:
   ```bash
   mysql -u root -p < backend/database.sql
   ```
3. Update the `.env` file in the backend folder with your MySQL credentials

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the backend folder:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=evangadi_forum
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create a new question (protected)
- `GET /api/questions/:id` - Get question with answers

### Answers
- `POST /api/questions/:id/answers` - Post an answer (protected)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **View Questions**: See all questions ordered by newest first
3. **Ask Question**: Click "Ask Question" to post a new programming question
4. **Answer Questions**: Click on any question to view details and post answers
5. **Navigation**: Use the navbar to navigate between pages

## Validation Rules

- **Password**: Minimum 8 characters required
- **Email**: Must be unique and valid format
- **Username**: Must be unique
- **Question Title**: Maximum 200 characters
- **All fields**: Required fields must be filled

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes for authenticated users only
- Input validation and sanitization
- CORS configuration

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Future Enhancements

- Edit/delete functionality for own posts
- User profiles
- Voting system for questions and answers
- Search functionality
- Categories/tags for questions
- Email notifications
