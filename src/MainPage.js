import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import Home from './pages/Home';


const Dashboard = ({ email, setEmail , worker_email }) => {
  const [currentDate, setCurrentDate] = useState("");
  const [homeowner, setHomeowner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  email = localStorage.getItem("email") || email;

  useEffect(() => {
    const fetchHomeownerDetails = async () => {
      try {
        const response = await fetch(`https://homemanagement-backend.onrender.com/api/homeowner/${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          setHomeowner(data);
        } else {
          console.error("Failed to fetch homeowner details");
        }
      } catch (error) {
        console.error("Failed to fetch homeowner:", error);
      }
      finally{
        setLoading(false);
      }
    };

    if (email) {
      fetchHomeownerDetails();
    }
  }, [email]);

  const user = {
    name: homeowner ? homeowner.name : "Guest",
    initials: homeowner ? homeowner.name.split(' ').map(n => n[0]).join('').toUpperCase() : "G",
    firstName: homeowner ? homeowner.name.split(' ')[0] : "Guest",
  };

  useEffect(() => {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setEmail("");
      localStorage.removeItem("homeowner_email");
      setHomeowner(null);
      navigate("/login");
    }
  };

  if(loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        {email ? "Loading..." : "Loading email..."}
      </div>
      </div>
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
        .dashboard {
          padding: 30px 0;
        }
        .welcome-card {
          background-color: var(--primary-color, #41644a);
          color: var(--white, #fff);
          padding: 40px;
          border-radius: 0;
          margin-bottom: 40px;
        }
        .welcome-card h1 {
          margin-bottom: 15px;
          font-size: 2.2rem;
        }
        .date-display {
          font-weight: 500;
          margin-bottom: 15px;
          font-size: 1.1rem;
        }
        .quick-stats {
          display: flex;
          gap: 20px;
          margin-top: 30px;
        }
        .stat {
          background: rgba(255, 255, 255, 0.2);
          padding: 15px;
          flex: 1;
          border-radius: 0;
        }
        .stat h3 {
          font-size: 1rem;
          margin-bottom: 5px;
        }
        .stat p {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }
        .feature-cards {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }
        .feature-card {
          flex: 1;
          min-width: 300px;
          background-color: var(--white, #fff);
          padding: 30px;
          border-radius: 0;
          box-shadow: var(--shadow, 0 4px 6px -1px rgba(0,0,0,0.1));
          transition: var(--transition, all 0.3s ease);
          position: relative;
          overflow: hidden;
          border: 1px solid var(--gray-100, #f1f0ea);
        }
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
          border-color: var(--secondary-color, #e9b384);
        }
        .feature-icon {
          font-size: 2.5rem;
          color: var(--primary-color, #41644a);
          margin-bottom: 20px;
        }
        .feature-card h2 {
          font-size: 1.5rem;
          margin-bottom: 15px;
        }
        .feature-card p {
          color: var(--text-light, #6b6b6b);
          margin-bottom: 25px;
        }
        .feature-btn {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          background-color: var(--primary-color, #41644a);
          color: var(--white, #fff);
          border-radius: 0;
          font-weight: 500;
          transition: var(--transition, all 0.3s ease);
          text-decoration: none;
        }
        .feature-btn i {
          margin-left: 8px;
          transition: var(--transition, all 0.3s ease);
        }
        .feature-btn:hover {
          background-color: var(--secondary-color, #e9b384);
          color: var(--primary-dark, #263a2d);
        }
        .feature-btn:hover i {
          transform: translateX(5px);
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
        }
        .logo i {
          margin-right: 10px;
          font-size: 1.5rem;
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
        }
        .nav-links a:hover {
          color: var(--primary-color, #41644a);
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
          background-color: var(--gray-100, #f1f0ea);
          border-radius: 0;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        .user-name {
          font-weight: 500;
          margin-right: 15px;
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
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        @media (max-width: 900px) {
          .feature-cards {
            flex-direction: column;
            gap: 20px;
          }
        }
        @media (max-width: 768px) {
          .welcome-card {
            padding: 20px;
          }
          .feature-card {
            padding: 18px;
            min-width: unset;
          }
          .dashboard-navbar {
            flex-direction: column;
            gap: 15px;
            padding: 15px;
          }
          .nav-links {
            order: 1;
          }
          .user-menu {
            order: 2;
            flex-direction: column;
            gap: 10px;
          }
          .logout-btn {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
          .container {
            padding: 0 15px;
          }
        }
      `}</style>

      {/* navbar */}
      {/* <nav className="dashboard-navbar">
        <div className="logo">
          <i className="fas fa-home-user"></i>
          HomeManager
          you are logged in as {email}
          you are logged in as{worker_email}
        </div>
        <div className="nav-links">
          <Link to="/main"><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
          <Link to="/Approve"><i className="fas fa-clipboard-check"></i> Approve Requests</Link>
          <Link to="/chat"><i className="fas fa-comments"></i> Chat</Link>
        </div>
        <div className="user-menu">
          <div className="user-avatar">{user.initials}</div>
          <div className="user-name">{user.name}</div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </nav> */}

      {/* Dashboard Content */}
      <div className="container">
        <section className="dashboard">
          <div className="welcome-card">
            <h1>Welcome back, {user.firstName}</h1>
            <div className="date-display">
              <i className="far fa-calendar-alt"></i>
              <span style={{ marginLeft: 8 }}>{currentDate}</span>
            </div>
            {/* <p>Here's what's happening with your home today.</p>
            <div className="quick-stats">
              <div className="stat">
                <h3>Pending Tasks</h3>
                <p>3</p>
              </div>
              <div className="stat">
                <h3>Bills Due</h3>
                <p>2</p>
              </div>
              <div className="stat">
                <h3>Active Rooms</h3>
                <p>4</p>
              </div>
            </div> */}
          </div>
          <div className="feature-cards">
            {/* Room Setup Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-door-open"></i>
              </div>
              <h2>Set Up Your Rooms</h2>
              <p>Create and customize rooms in your home. Track inventory, dimensions, and conditions.</p>
            <Link to="/home" className="feature-btn">
             Set Up Rooms <i className="fas fa-arrow-right"></i>
            </Link>
            </div>
            {/* Maintenance Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-tools"></i>
              </div>
              <h2>Request Maintenance</h2>
              <p>Schedule repairs, track ongoing maintenance, and keep history of all home services.</p>
              <Link to="/Req_main" className="feature-btn">
                Request Service <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            {/* Bill Prediction Card */}
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h2>Predict Your Bills</h2>
              <p>Analyze past utility usage and predict future expenses with our smart estimator.</p>
              <Link to="/predict-bills" className="feature-btn">
  View Predictions <i className="fas fa-arrow-right"></i>
</Link>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  worker_email: PropTypes.string
};

export default Dashboard;