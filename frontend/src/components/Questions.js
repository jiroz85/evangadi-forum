import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Questions = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/questions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuestions(response.data);
    } catch (err) {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="questions-container">
      <div className="questions-header">
        <div className="questions-actions">
          <Link to="/ask-question" className="btn btn-primary">
            Ask Question
          </Link>
        </div>
        <div className="welcome-message">Welcome: {user.firstName}</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="questions-section">
        <h2 className="section-title">Questions</h2>
        <div className="section-divider"></div>

        {questions.length === 0 ? (
          <div className="empty-state">
            No questions yet. Be the first to ask a question!
          </div>
        ) : (
          questions.map((question) => (
            <Link
              key={question.id}
              to={`/question/${question.id}`}
              className="question-link"
            >
              <div className="question-item">
                <div className="question-avatar">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="question-content">
                  <div className="question-title">{question.title}</div>
                  <div className="question-meta">{question.username}</div>
                </div>
                <div className="question-arrow">&gt;</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Questions;
