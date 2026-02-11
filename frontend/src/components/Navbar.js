import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Evangadi Forum
          </Link>
          <div className="navbar-links">
            {user ? (
              <>
                <Link to="/questions" className="navbar-link">
                  Home
                </Link>
                <Link to="/ask-question" className="navbar-link">
                  How it Works
                </Link>
                <button onClick={handleLogout} className="btn btn-danger">
                  LogOut
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
                <Link to="/signup" className="navbar-link">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
