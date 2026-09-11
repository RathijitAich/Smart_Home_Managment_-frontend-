import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const CurrentJob = ({ worker_email, setWorkerEmail }) => {
  const [worker, setWorker] = useState(null);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch worker details
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
      }
    };

    if (worker_email) {
      fetchWorkerDetails();
    }
  }, [worker_email]);

  // Fetch current jobs assigned to this worker
  useEffect(() => {
    const fetchCurrentJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://homemanagement-backend.onrender.com/api/job-applications/worker/${worker_email}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Current jobs data:", data);
          // Filter only approved/in-progress jobs
          const activeJobs = data.filter(assignment => 
            assignment.applicationStatus === "approved" 
          );
          setCurrentJobs(activeJobs);
        } else {
          const errorText = await response.text();
          setError(`Failed to fetch current jobs: ${response.status} ${errorText}`);
        }
      } catch (error) {
        console.error("Error fetching current jobs:", error);
        setError(`Network error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (worker_email) {
      fetchCurrentJobs();
    }
  }, [worker_email]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setWorkerEmail("");
      localStorage.removeItem("worker_email");
      setWorker(null);
      navigate("/Worker_login");
    }
  };

  const handleCompleteJob = async (assignment) => {
    console.log("Assignment object:", assignment);
    
    if (window.confirm("Are you sure you want to mark this job as completed?")) {
      try {
        if (!assignment?.job?.issueTitle || !assignment?.homeowner?.email || !assignment?.worker?.email) {
          alert("Missing required data. Cannot process job completion.");
          console.error("Missing data:", {
            issueTitle: assignment?.job?.issueTitle,
            homeownerEmail: assignment?.homeowner?.email,
            workerEmail: assignment?.worker?.email
          });
          return;
        }

        const requestData = {
          issueTitle: assignment.job.issueTitle,
          homeownerEmail: assignment.homeowner.email,
          workerEmail: assignment.worker.email,
          status: "completed"
        };

        console.log("Sending completion request:", requestData);

        const response = await fetch(`https://homemanagement-backend.onrender.com/api/job-applications/update-status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          alert("Job marked as completed successfully!");
          // Remove completed job from current jobs list
          const updatedJobs = currentJobs.filter(job => 
            !(job.job?.issueTitle === assignment.job.issueTitle && 
              job.homeowner?.email === assignment.homeowner.email && 
              job.worker?.email === assignment.worker.email)
          );
          setCurrentJobs(updatedJobs);
        } else {
          alert("Failed to mark job as completed");
        }
      } catch (error) {
        console.error("Error completing job:", error);
        alert("Error completing job");
      }
    }
  };

  const user = {
    initials: worker ? worker.name.split(' ').map(n => n[0]).join('').toUpperCase() : "W",
    name: worker ? worker.name : "Worker",
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "#28a745";
      case "in-progress": return "#ffc107";
      case "completed": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading current jobs...</div>
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
          color: var(--worker-color, #059669);
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
          color: var(--worker-color, #059669);
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
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .page-header {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .page-title {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        
        .page-subtitle {
          opacity: 0.9;
        }
        
        .jobs-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .section-header {
          background: #f8f9fa;
          padding: 20px;
          border-bottom: 1px solid #dee2e6;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        
        .jobs-grid {
          padding: 20px;
          display: grid;
          gap: 20px;
        }
        
        .job-card {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
          border-left: 4px solid #059669;
        }
        
        .job-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }
        
        .job-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }
        
        .job-meta {
          display: flex;
          gap: 15px;
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 15px;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .homeowner-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 15px;
        }
        
        .homeowner-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }
        
        .homeowner-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          font-size: 0.9rem;
          color: #666;
        }
        
        .homeowner-detail {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .job-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }
        
        .detail-item i {
          color: #059669;
          width: 16px;
        }
        
        .job-description {
          color: #555;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .complete-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .complete-btn:hover {
          background: #218838;
          transform: translateY(-1px);
        }
        
        .no-jobs {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        
        .no-jobs i {
          font-size: 4rem;
          color: #ddd;
          margin-bottom: 20px;
        }
        
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }
        
        @media (max-width: 768px) {
          .homeowner-details, .job-details {
            grid-template-columns: 1fr;
          }
          
          .job-header {
            flex-direction: column;
            gap: 10px;
          }
          
          .actions {
            justify-content: stretch;
          }
          
          .complete-btn {
            flex: 1;
          }
          
          .dashboard-navbar {
            flex-direction: column;
            gap: 15px;
            padding: 15px;
          }
        }
      `}</style>

      {/* Navbar */}
      {/* <nav className="dashboard-navbar">
        <div className="logo">
          <i className="fas fa-tools"></i>
          WorkerPortal
        </div>
        <div className="nav-links">
          <Link to="/WorkerDashboard"><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
          <Link to="/ViewJobs"><i className="fas fa-search"></i> Available Jobs</Link>
          <Link to="/worker-notifications"><i className="fas fa-bell"></i> Notifications</Link>
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

      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-briefcase"></i> My Current Jobs
          </h1>
          <p className="page-subtitle">Manage your assigned and ongoing maintenance jobs</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Jobs Section */}
        <div className="jobs-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-clipboard-list"></i> Active Jobs ({currentJobs.length})
            </h2>
          </div>
          
          <div className="jobs-grid">
            {currentJobs.length > 0 ? (
              currentJobs.map((assignment) => (
                <div key={assignment.id} className="job-card">
                  <div className="job-header">
                    <div>
                      <h3 className="job-title">{assignment.job?.issueTitle || 'No Title'}</h3>
                      <div className="job-meta">
                        <div className="meta-item">
                          <i className="fas fa-tools"></i>
                          <span style={{ textTransform: 'capitalize' }}>{assignment.job?.serviceType || 'Unknown'}</span>
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span style={{ textTransform: 'capitalize' }}>{assignment.job?.roomLocation || 'Unknown'}</span>
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-calendar"></i>
                          <span>{formatDate(assignment.job?.preferredDate)}</span>
                        </div>
                      </div>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(assignment.applicationStatus) + '20',
                        color: getStatusColor(assignment.applicationStatus),
                        border: `1px solid ${getStatusColor(assignment.applicationStatus)}40`
                      }}
                    >
                      {assignment.applicationStatus || 'Unknown'}
                    </span>
                  </div>

                  {/* Homeowner Information */}
                  <div className="homeowner-info">
                    <div className="homeowner-name">
                      <i className="fas fa-home"></i> {assignment.homeowner?.name || 'Unknown Homeowner'}
                    </div>
                    <div className="homeowner-details">
                      <div className="homeowner-detail">
                        <i className="fas fa-envelope"></i>
                        <span>{assignment.homeowner?.email || 'No email'}</span>
                      </div>
                      <div className="homeowner-detail">
                        <i className="fas fa-home-user"></i>
                        <span>{assignment.homeowner?.houseName || 'No house name'}</span>
                      </div>
                      <div className="homeowner-detail">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{assignment.homeowner?.city || 'Unknown city'}, {assignment.homeowner?.country || 'Unknown country'}</span>
                      </div>
                      <div className="homeowner-detail">
                        <i className="fas fa-location-arrow"></i>
                        <span>{assignment.homeowner?.place || 'No specific location'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <p className="job-description">
                    {assignment.job?.issueDescription || 'No description available'}
                  </p>

                  {/* Job Details */}
                  <div className="job-details">
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <span>Time: {assignment.job?.preferredTime || "Flexible"}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-exclamation-circle"></i>
                      <span style={{ textTransform: 'capitalize' }}>Priority: {assignment.job?.priorityLevel || 'Unknown'}</span>
                    </div>
                    {assignment.job?.accessInstructions && (
                      <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                        <i className="fas fa-key"></i>
                        <span>Access: {assignment.job.accessInstructions}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="actions">
                    <button 
                      className="complete-btn"
                      onClick={() => {
                        console.log("Complete button clicked with assignment:", assignment);
                        handleCompleteJob(assignment);
                      }}
                    >
                      <i className="fas fa-check-circle"></i>
                      Mark as Completed
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-jobs">
                <i className="fas fa-briefcase"></i>
                <h3>No Current Jobs</h3>
                <p>You don't have any active jobs at the moment.</p>
                <Link to="/ViewJobs" style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginTop: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#059669',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '500'
                }}>
                  <i className="fas fa-search"></i>
                  Browse Available Jobs
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CurrentJob.propTypes = {
  worker_email: PropTypes.string.isRequired,
  setWorkerEmail: PropTypes.func.isRequired,
};

export default CurrentJob;