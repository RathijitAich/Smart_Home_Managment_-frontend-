import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const WorkerDashboard = ({ worker_email, setWorkerEmail }) => {
  const [currentDate, setCurrentDate] = useState("");
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        const response = await fetch(`https://homemanagement-backend.onrender.com/api/maintenance-worker/${encodeURIComponent(worker_email)}`);
        if (response.ok) {
          const data = await response.json();
          setWorker(data);
        } else {
          console.error("Failed to fetch worker details");
        }
      } catch (error) {
        console.error("Failed to fetch worker:", error);
      } finally {
        setLoading(false);
      }
    };

    if (worker_email) {
      fetchWorkerDetails();
    }
  }, [worker_email]);

  useEffect(() => {
    const now = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  const user = {
    initials: worker ? worker.name.split(' ').map(n => n[0]).join('').toUpperCase() : "W",
    name: worker ? worker.name : "Worker",
    firstName: worker ? worker.name.split(' ')[0] : "Worker",
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setWorkerEmail("");
      localStorage.removeItem("worker_email");
      setWorker(null);
      navigate("/Worker_login");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#F8FAFC',
        fontSize: '1.1rem',
        color: '#64748B'
      }}>
        <div>Loading worker dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />
      <style>{`
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background-color: #F8FAFC;
          color: #1E293B;
        }
        
        .dashboard-container {
          min-height: 100vh;
          background-color: #F8FAFC;
          padding: 24px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .welcome-section {
          background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%);
          color: white;
          padding: 32px;
          border-radius: 16px;
          margin-bottom: 32px;
          box-shadow: 0 10px 25px rgba(30, 64, 175, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .welcome-section::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transform: translate(50px, -50px);
        }
        
        .welcome-content {
          position: relative;
          z-index: 1;
        }
        
        .welcome-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.025em;
        }
        
        .welcome-date {
          font-size: 1.1rem;
          font-weight: 500;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        
        .worker-info-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 1px solid #E2E8F0;
        }
        
        .worker-info-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #1E293B;
        }
        
        .worker-info-title {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .worker-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .worker-detail {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #F8FAFC;
          border-radius: 10px;
          border-left: 4px solid #3B82F6;
        }
        
        .worker-detail i {
          width: 20px;
          color: #3B82F6;
          font-size: 1rem;
        }
        
        .worker-detail span {
          color: #475569;
          font-weight: 500;
        }
        
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }
        
        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 1px solid #E2E8F0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3B82F6, #8B5CF6);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          border-color: #3B82F6;
        }
        
        .feature-card:hover::before {
          transform: scaleX(1);
        }
        
        .feature-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 1.75rem;
          transition: all 0.3s ease;
        }
        
        .feature-card:nth-child(1) .feature-icon {
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          color: #2563EB;
        }
        
        .feature-card:nth-child(2) .feature-icon {
          background: linear-gradient(135deg, #F0FDF4, #DCFCE7);
          color: #16A34A;
        }
        
        .feature-card:nth-child(3) .feature-icon {
          background: linear-gradient(135deg, #FDF4FF, #FAE8FF);
          color: #A855F7;
        }
        
        .feature-title {
          font-size: 1.375rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 12px;
        }
        
        .feature-description {
          color: #64748B;
          line-height: 1.6;
          margin-bottom: 24px;
          font-size: 0.95rem;
        }
        
        .feature-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .feature-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .feature-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
          color: white;
        }
        
        .feature-btn:hover::before {
          left: 100%;
        }
        
        .feature-btn i {
          transition: transform 0.3s ease;
        }
        
        .feature-btn:hover i {
          transform: translateX(4px);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
          }
          
          .welcome-section {
            padding: 24px;
          }
          
          .welcome-title {
            font-size: 1.875rem;
          }
          
          .feature-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .feature-card {
            padding: 20px;
          }
          
          .worker-details {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .welcome-title {
            font-size: 1.5rem;
          }
          
          .feature-title {
            font-size: 1.25rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h1 className="welcome-title">Welcome back, {user.firstName}!</h1>
              <div className="welcome-date">
                <i className="fas fa-calendar-alt"></i>
                <span>{currentDate}</span>
              </div>
              
              {/* Quick Stats */}
              
            </div>
          </div>

          {/* Worker Info Card */}
          {worker && (
            <div className="worker-info-card">
              <div className="worker-info-header">
                <i className="fas fa-user-circle"></i>
                <h3 className="worker-info-title">Worker Profile</h3>
              </div>
              <div className="worker-details">
                <div className="worker-detail">
                  <i className="fas fa-envelope"></i>
                  <span>{worker.email}</span>
                </div>
                <div className="worker-detail">
                  <i className="fas fa-phone"></i>
                  <span>{worker.phone}</span>
                </div>
                <div className="worker-detail">
                  <i className="fas fa-tools"></i>
                  <span style={{ textTransform: 'capitalize' }}>{worker.skill}</span>
                </div>
                <div className="worker-detail">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{worker.address}</span>
                </div>
              </div>
            </div>
          )}

          {/* Feature Cards */}
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-search"></i>
              </div>
              <h2 className="feature-title">Available Jobs</h2>
              <p className="feature-description">
                Browse and apply for maintenance jobs in your area that match your skills and expertise.
              </p>
              <Link to="/show-jobs" className="feature-btn">
                View Jobs <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h2 className="feature-title">Current Jobs</h2>
              <p className="feature-description">
                Manage your ongoing projects, update progress, and communicate with homeowners effectively.
              </p>
              <Link to="/current-jobs" className="feature-btn">
                Manage Jobs <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-history"></i>
              </div>
              <h2 className="feature-title">Job History</h2>
              <p className="feature-description">
                Review your completed jobs, customer ratings, and track your professional growth over time.
              </p>
              <Link to="/job-history" className="feature-btn">
                View History <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

WorkerDashboard.propTypes = {
  worker_email: PropTypes.string.isRequired,
  setWorkerEmail: PropTypes.func.isRequired,
};

export default WorkerDashboard;