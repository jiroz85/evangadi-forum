import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", formData);

      if (response.data.token && response.data.user) {
        onLogin(response.data.user, response.data.token);
        navigate("/questions");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h2 className="auth-title bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Login to Evangadi Forum
        </h2>

        {error && <div className="error-message animate-slide-in">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label
              className="form-label flex items-center text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label
              className="form-label flex items-center text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full relative overflow-hidden group"
            disabled={loading}
          >
            <span className="relative z-10">
              {loading ? "Logging in..." : "Login"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>

        <p className="auth-link text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold hover:text-primary-400 transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
