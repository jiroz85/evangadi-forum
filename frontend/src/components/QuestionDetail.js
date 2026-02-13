import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const QuestionDetail = ({ user }) => {
  const { id } = useParams();
  const [questionData, setQuestionData] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/questions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setQuestionData(response.data);
    } catch (err) {
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await api.post(`/api/questions/${id}/answers`, 
        { answer },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Refresh question data to show new answer
      await fetchQuestion();
      setAnswer('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return <div>Loading question...</div>;
  }

  if (!questionData) {
    return <div>Question not found</div>;
  }

  return (
    <div>
      <Link to="/questions" style={{ color: '#3498db', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Questions
      </Link>

      <div className="card">
        <h1 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
          {questionData.question.title}
        </h1>
        
        <div style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
          Asked by {questionData.question.username} • {formatDate(questionData.question.created_at)}
        </div>
        
        <div style={{ 
          lineHeight: '1.6', 
          fontSize: '1.1rem', 
          whiteSpace: 'pre-wrap',
          marginBottom: '2rem'
        }}>
          {questionData.question.description}
        </div>

        <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #eee' }} />

        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
          {questionData.answers.length} {questionData.answers.length === 1 ? 'Answer' : 'Answers'}
        </h3>

        {questionData.answers.length === 0 ? (
          <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
            No answers yet. Be the first to answer!
          </p>
        ) : (
          questionData.answers.map((answer) => (
            <div key={answer.id} className="answer-item">
              <div className="answer-content">{answer.answer}</div>
              <div className="answer-meta">
                Answered by {answer.username} • {formatDate(answer.created_at)}
              </div>
            </div>
          ))
        )}

        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Your Answer</h4>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmitAnswer}>
            <div className="form-group">
              <textarea
                className="form-control"
                rows="4"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your answer here..."
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Posting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
