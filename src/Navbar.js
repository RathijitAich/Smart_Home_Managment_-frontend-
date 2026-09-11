import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const Navbar = ({ email, setEmail, worker_email, setWorkerEmail }) => {
  const [homeowner, setHomeowner] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get current user email from localStorage or props
  const currentEmail = localStorage.getItem("email") || email;
  const currentWorkerEmail = localStorage.getItem("worker_email") || worker_email;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Fetch homeowner details if email exists
        if (currentEmail) {
          const homeownerResponse = await fetch(`https://homemanagement-backend.onrender.com/api/homeowner/${encodeURIComponent(currentEmail)}`);
          if (homeownerResponse.ok) {
            const homeownerData = await homeownerResponse.json();
            setHomeowner(homeownerData);
          }
        }

        // Fetch worker details if worker_email exists
        if (currentWorkerEmail) {
          const workerResponse = await fetch(`https://homemanagement-backend.onrender.com/api/maintenance-worker/${encodeURIComponent(currentWorkerEmail)}`);
          if (workerResponse.ok) {
            const workerData = await workerResponse.json();
            setWorker(workerData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentEmail || currentWorkerEmail) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [currentEmail, currentWorkerEmail]);

  // Determine current user info
  const user = {
    name: homeowner ? homeowner.name : (worker ? worker.name : "Guest"),
    initials: homeowner 
      ? homeowner.name.split(' ').map(n => n[0]).join('').toUpperCase()
      : (worker ? worker.name.split(' ').map(n => n[0]).join('').toUpperCase() : "G"),
    type: homeowner ? 'homeowner' : (worker ? 'worker' : 'guest'),
    email: currentEmail || currentWorkerEmail || ''
  };

  // Navigation links based on user type
  const getNavigationLinks = () => {
    if (user.type === 'homeowner') {
      return [
        { path: "/main", icon: "fas fa-tachometer-alt", label: "Dashboard" },
        { path: "/Approve", icon: "fas fa-clipboard-check", label: "Approve Requests" },
        { path: "/chat", icon: "fas fa-comments", label: "Chat" },
        { path : "/review-worker", icon: "fas fa-users", label: "Review Workers"},
        // Add more homeowner-specific links here
        // { path: "/manage-properties", icon: "fas fa-building", label: "Properties" },
        // { path: "/payment-history", icon: "fas fa-credit-card", label: "Payments" },
      ];
    } else if (user.type === 'worker') {
      return [
        { path: "/worker-dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
        {path: "/chat", icon: "fas fa-comments", label: "Chat"},
        // Add more worker-specific links here if needed
        // { path: "/my-jobs", icon: "fas fa-briefcase", label: "My Jobs" },
        // { path: "/schedule", icon: "fas fa-calendar", label: "Schedule" },
      ];
    } else {
      return [
        { path: "/main", icon: "fas fa-tachometer-alt", label: "Dashboard" },
      ];
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear all user data
      setEmail("");
      setWorkerEmail("");
      
      // Clear localStorage
      localStorage.removeItem("email");
      localStorage.removeItem("homeowner_email");
      localStorage.removeItem("worker_email");
      
      // Reset state
      setHomeowner(null);
      setWorker(null);
      
      // Navigate to appropriate login page based on user type
      if (user.type === 'worker') {
        navigate("/Worker_login");
      } else {
        navigate("/login");
      }
    }
  };

  if (loading) {
    return (
      <nav className="dashboard-navbar">
        <div className="logo">
          <i className="fas fa-home-user"></i>
          HomeManager
        </div>
        <div style={{ padding: '20px' }}>Loading...</div>
      </nav>
    );
  }

  return (
    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" />

      <style>{`
        * {
          font-family: 'Poppins', sans-serif;
        }
        .dashboard-navbar {
          background-color: var(--white, #fff);
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow, 0 4px 6px -1px rgba(0,0,0,0.1));
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.3rem;
          color: var(--primary-color, #41644a);
          flex-direction: column;
          align-items: flex-start;
        }
        .logo i {
          margin-right: 10px;
          font-size: 1.5rem;
        }
        .logo-main {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        .user-info {
          font-size: 0.75rem;
          color: var(--text-light, #6b6b6b);
          font-weight: 400;
        }
        .user-type-badge {
          background-color: var(--primary-color, #41644a);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
          margin-left: 8px;
          text-transform: uppercase;
        }
        .user-type-badge.worker {
          background-color: #007bff;
        }
        .nav-links {
          display: flex;
          align-items: center;
        }
        .nav-links a {
          margin-left: 25px;
          color: var(--text-dark, #252525);
          font-weight: 500;
          transition: var(--transition, all 0.3s ease);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-links a:hover {
          color: var(--primary-color, #41644a);
        }
        .nav-links a.active {
          color: var(--primary-color, #41644a);
          font-weight: 600;
        }
        .user-menu {
          display: flex;
          align-items: center;
          cursor: pointer;
          position: relative;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          background-color: var(--primary-color, #41644a);
          color: white;
          border-radius: 50%;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .user-avatar.worker {
          background-color: #007bff;
        }
        .user-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-right: 15px;
        }
        .user-name {
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 2px;
        }
        .user-email {
          font-size: 0.75rem;
          color: var(--text-light, #6b6b6b);
        }
        .logout-btn {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .logout-btn:hover {
          background-color: #c82333;
          transform: translateY(-1px);
        }
        .logout-btn i {
          font-size: 0.85rem;
        }
        @media (max-width: 768px) {
          .dashboard-navbar {
            flex-direction: column;
            gap: 15px;
            padding: 15px;
          }
          .logo {
            align-items: center;
          }
          .user-info {
            text-align: center;
          }
          .nav-links {
            order: 1;
            flex-wrap: wrap;
            justify-content: center;
          }
          .nav-links a {
            margin: 5px 10px;
          }
          .user-menu {
            order: 2;
            flex-direction: column;
            gap: 10px;
          }
          .user-details {
            align-items: center;
            margin-right: 0;
            margin-bottom: 10px;
          }
          .logout-btn {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
        }
        @media (max-width: 480px) {
          .logo {
            font-size: 1.1rem;
          }
          .user-info {
            font-size: 0.7rem;
          }
          .nav-links a {
            font-size: 0.85rem;
            margin: 5px 8px;
          }
        }
      `}</style>

      <nav className="dashboard-navbar">
        <div className="logo">
          <div className="logo-main">
            <i className="fas fa-home-user"></i>
            HomeManager
          </div>
          <div className="user-info">
            {user.type === 'homeowner' && currentEmail && (
              <span>
                Homeowner: {currentEmail}
                <span className="user-type-badge">Owner</span>
              </span>
            )}
            {user.type === 'worker' && currentWorkerEmail && (
              <span>
                Worker: {currentWorkerEmail}
                <span className="user-type-badge worker">Worker</span>
              </span>
            )}
            {user.type === 'guest' && (
              <span>Guest User</span>
            )}
          </div>
        </div>
        
        <div className="nav-links">
          {getNavigationLinks().map((link, index) => (
            <Link key={index} to={link.path}>
              <i className={link.icon}></i>
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="user-menu">
          <div className={`user-avatar ${user.type === 'worker' ? 'worker' : ''}`}>
            {user.initials}
          </div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

Navbar.propTypes = {
  email: PropTypes.string,
  setEmail: PropTypes.func.isRequired,
  worker_email: PropTypes.string,
  setWorkerEmail: PropTypes.func.isRequired
};

export default Navbar;