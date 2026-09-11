import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const ShowJobs = ({ worker_email, setWorkerEmail }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState(null);
  const [filters, setFilters] = useState({
    serviceType: "",
    priorityLevel: "",
    roomLocation: "",
    searchTerm: "",
  });
  const navigate = useNavigate();

  // Fetch worker details
  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        const response = await fetch(`https://homemanagement-backend.onrender.com/api/maintenance-worker/${encodeURIComponent(worker_email)}`);
        if (response.ok) {
          const data = await response.json();
          setWorker(data);
        }
      } catch (error) {
        console.error("Failed to fetch worker:", error);
      }
    };

    if (worker_email) {
      fetchWorkerDetails();
    }
  }, [worker_email]);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("https://homemanagement-backend.onrender.com/api/jobs");
        console.log("Fetching jobs from backend...");
        if (response.ok) {
          console.log("jobs fetched successfully", response);
          
          const data = await response.json();
          console.log("data:", data);
          // Filter only available jobs
          const availableJobs = data.filter(job => job.jobStatus === "Available");
          setJobs(availableJobs);
          setFilteredJobs(availableJobs);
        } else {
          
          console.error("Failed to fetch jobs");
        }
      }

       catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = jobs;

    if (filters.serviceType) {
      filtered = filtered.filter(job => job.serviceType === filters.serviceType);
    }

    if (filters.priorityLevel) {
      filtered = filtered.filter(job => job.priorityLevel === filters.priorityLevel);
    }

    if (filters.roomLocation) {
      filtered = filtered.filter(job => job.roomLocation === filters.roomLocation);
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(job => 
        job.issueTitle.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.issueDescription.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [filters, jobs]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({
      serviceType: "",
      priorityLevel: "",
      roomLocation: "",
      searchTerm: "",
    });
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setWorkerEmail("");
      localStorage.removeItem("worker_email");
      setWorker(null);
      navigate("/Worker_login");
    }
  };

 const handleApplyJob = async (job) => {
  if (window.confirm("Are you sure you want to apply for this job?")) {
    try {
      const applicationData = {
        issueTitle: job.issueTitle,
        homeownerEmail: job.homeowner?.email,
        workerEmail: worker_email,
        status: "pending"
      };

      const response = await fetch("https://homemanagement-backend.onrender.com/api/job-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      console.log("Submitting job application:", applicationData);
      
      if (response.ok) {
        const result = await response.json();
        alert("Job application submitted successfully! The homeowner will be notified.");
        // Optionally refresh the jobs list to remove applied job
        // fetchJobs();
      } else {
        const errorData = await response.json();
        alert(`Failed to submit application: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting job application:", error);
      alert("Network error. Please check your connection and try again.");
    }
  }
};

  const user = {
    initials: worker ? worker.name.split(' ').map(n => n[0]).join('').toUpperCase() : "W",
    name: worker ? worker.name : "Worker",
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#dc3545";
      case "medium": return "#ffc107";
      case "low": return "#28a745";
      default: return "#6c757d";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Flexible";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading available jobs...</div>
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
        
        .filters-section {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 20px;
          align-items: end;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-label {
          font-weight: 500;
          margin-bottom: 8px;
          color: #333;
        }
        
        .filter-input, .filter-select {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: border-color 0.3s ease;
        }
        
        .filter-input:focus, .filter-select:focus {
          outline: none;
          border-color: #059669;
          box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
        }
        
        .clear-filters-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        
        .clear-filters-btn:hover {
          background: #5a6268;
        }
        
        .jobs-count {
          background: #e8f5e8;
          color: #059669;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .jobs-grid {
          display: grid;
          gap: 20px;
        }
        
        .job-card {
          background: white;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border-left: 4px solid #059669;
        }
        
        .job-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }
        
        .job-title {
          font-size: 1.3rem;
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
        
        .priority-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .job-description {
          color: #555;
          line-height: 1.6;
          margin-bottom: 20px;
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
        
        .job-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .posted-date {
          font-size: 0.85rem;
          color: #888;
        }
        
        .apply-btn {
          background: linear-gradient(45deg, #059669, #10b981);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .apply-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
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
        
        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .job-details {
            grid-template-columns: 1fr;
          }
          
          .job-header {
            flex-direction: column;
            gap: 10px;
          }
          
          .job-meta {
            flex-wrap: wrap;
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
            <i className="fas fa-search"></i> Available Jobs
          </h1>
          <p className="page-subtitle">Find maintenance jobs that match your skills and schedule</p>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Search Jobs</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Search by title or description..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Service Type</label>
              <select
                className="filter-select"
                value={filters.serviceType}
                onChange={(e) => handleFilterChange("serviceType", e.target.value)}
              >
                <option value="">All Services</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="hvac">HVAC</option>
                <option value="appliance">Appliance Repair</option>
                <option value="structural">Structural Repair</option>
                <option value="landscaping">Landscaping</option>
                <option value="cleaning">Cleaning</option>
                <option value="pest">Pest Control</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Priority</label>
              <select
                className="filter-select"
                value={filters.priorityLevel}
                onChange={(e) => handleFilterChange("priorityLevel", e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Location</label>
              <select
                className="filter-select"
                value={filters.roomLocation}
                onChange={(e) => handleFilterChange("roomLocation", e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="bedroom">Bedroom</option>
                <option value="living-room">Living Room</option>
                <option value="dining-room">Dining Room</option>
                <option value="laundry">Laundry Room</option>
                <option value="garage">Garage</option>
                <option value="outdoor">Outdoor/Garden</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <button className="clear-filters-btn" onClick={clearFilters}>
              <i className="fas fa-times"></i> Clear
            </button>
          </div>
        </div>

        {/* Jobs Count */}
        <div className="jobs-count">
          <i className="fas fa-briefcase"></i> {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
        </div>

        {/* Jobs Grid */}
        <div className="jobs-grid">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div>
                    <h3 className="job-title">{job.issueTitle}</h3>
                    <div className="job-meta">
                      <div className="meta-item">
                        <i className="fas fa-tools"></i>
                        <span style={{ textTransform: 'capitalize' }}>{job.serviceType}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span style={{ textTransform: 'capitalize' }}>{job.roomLocation}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-envelope"></i>
                        <span>{job.homeowner_email}</span>
                      </div>
                    </div>
                  </div>
                  <span 
                    className="priority-badge"
                    style={{ 
                      backgroundColor: getPriorityColor(job.priorityLevel) + '20',
                      color: getPriorityColor(job.priorityLevel),
                      border: `1px solid ${getPriorityColor(job.priorityLevel)}40`
                    }}
                  >
                    {job.priorityLevel} Priority
                  </span>
                </div>

                <p className="job-description">{job.issueDescription}</p>
                <p>{job.homeowner?.name || 'No homeowner ID'}</p>

                <div className="job-details">
                  <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>Preferred Date: {formatDate(job.preferredDate)}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span>Time: {job.preferredTime || "Flexible"}</span>
                  </div>
                  {job.accessInstructions && (
                    <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                      <i className="fas fa-key"></i>
                      <span>Access: {job.accessInstructions}</span>
                    </div>
                  )}
                </div>

                <div className="job-actions">
                  <span className="posted-date">
                    Posted: {formatDate(job.requestDate)}
                  </span>
                  <button 
                    className="apply-btn"
                    onClick={() => handleApplyJob(job)}
                  >
                    <i className="fas fa-hand-paper"></i>
                    Apply for Job
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs">
              <i className="fas fa-search"></i>
              <h3>No jobs found</h3>
              <p>Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ShowJobs.propTypes = {
  worker_email: PropTypes.string.isRequired,
  setWorkerEmail: PropTypes.func.isRequired,
};

export default ShowJobs;