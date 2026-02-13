import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AskQuestion = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'title' && value.length > 200) {
      return; // Prevent typing beyond 200 characters
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await api.post('/api/questions', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      navigate('/questions');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="instructions">
        <h3>How to write a good question:</h3>
        <ol>
          <li>Summarize your problem in a one-line title</li>
          <li>Describe your problem in more detail</li>
          <li>Describe what you tried and what you expected to happen</li>
          <li>Review your question and post it to the site</li>
        </ol>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Ask a Question</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Question Title (max 200 characters)
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your programming question? Be specific."
              required
              maxLength={200}
            />
            <small style={{ color: '#7f8c8d' }}>
              {formData.title.length}/200 characters
            </small>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Question Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows="8"
              value={formData.description}
              onChange={handleChange}
              placeholder="Include all the information someone would need to answer your question"
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Your Question'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/questions')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;
