import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Questions from "./components/Questions";
import QuestionDetail from "./components/QuestionDetail";
import AskQuestion from "./components/AskQuestion";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route
            path="/login"
            element={
              !user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/questions" />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !user ? (
                <Signup onLogin={handleLogin} />
              ) : (
                <Navigate to="/questions" />
              )
            }
          />
          <Route
            path="/questions"
            element={
              user ? <Questions user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/questions/:id"
            element={
              user ? <QuestionDetail user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/question/:id"
            element={
              user ? <QuestionDetail user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/ask-question"
            element={
              user ? <AskQuestion user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/"
            element={
              user ? <Navigate to="/questions" /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
