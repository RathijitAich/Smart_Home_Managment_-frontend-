import React, { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

// You can replace these with props/context for real user info
const user = {
  initials: "JD",
  name: "John Doe",
};



function MaintenanceRequest({ email, setEmail }) {

  const initialForm = {
    serviceType: "",
    roomLocation: "",
    issueTitle: "",
    issueDescription: "",
    priorityLevel: "",
    preferredDate: "",
    preferredTime: "",
    accessInstructions: "",

  };

  const priorityOptions = [
    {
      value: "low",
      icon: "fas fa-battery-quarter",
      label: "Low",
      desc: "Can be fixed within the week",
      className: "low-priority",
    },
    {
      value: "medium",
      icon: "fas fa-battery-half",
      label: "Medium",
      desc: "Needs attention within 48 hours",
      className: "medium-priority",
    },
    {
      value: "high",
      icon: "fas fa-battery-full",
      label: "High",
      desc: "Requires immediate attention",
      className: "high-priority",
    },
  ];
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrioritySelect = (value) => {
    setForm((prev) => ({ ...prev, priorityLevel: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.serviceType) newErrors.serviceType = "Service type is required";
    if (!form.roomLocation) newErrors.roomLocation = "Room location is required";
    if (!form.issueTitle) newErrors.issueTitle = "Issue title is required";
    if (!form.issueDescription) newErrors.issueDescription = "Description is required";
    if (!form.priorityLevel) newErrors.priorityLevel = "Priority level is required";
    return newErrors;
  };

  const submitMaintenanceRequest = async (requestData) => {
    try {
      const response = await fetch("https://homemanagement-backend.onrender.com/api/maintenance-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Failed to submit maintenance request"
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Network error. Please check your connection and try again."
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    // Prepare data for backend
    const requestData = {
      serviceType: form.serviceType,
      roomLocation: form.roomLocation,
      issueTitle: form.issueTitle,
      issueDescription: form.issueDescription,
      priorityLevel: form.priorityLevel,
      preferredDate: form.preferredDate || null,
      preferredTime: form.preferredTime || null,
      accessInstructions: form.accessInstructions || null,
      job_status: "Available", // Default status
      homeowner_email: email, // Add homeowner email
    };

    try {
      const result = await submitMaintenanceRequest(requestData);

      if (result.success) {
        alert("Maintenance request submitted successfully! You will be notified when a worker is assigned.");
        setForm(initialForm);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear email
      setEmail("");
      // Clear any localStorage data if needed
      localStorage.removeItem("homeowner_email");
      // Reset form
      setForm(initialForm);
    }
  };

  return (
    <div>
      {/* FontAwesome and Google Fonts */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" />
      <style>{`
        body { font-family: 'Poppins', sans-serif; }
        .maintenance-form-container {
          max-width: 800px;
          margin: 40px auto;
          background-color: var(--white, #fff);
          padding: 40px;
          border-radius: 0;
          box-shadow: var(--shadow, 0 4px 6px -1px rgba(0,0,0,0.1));
        }
        .page-title {
          margin-bottom: 30px;
          position: relative;
          display: inline-block;
        }
        .page-title::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 5px;
          background-color: rgba(233, 179, 132, 0.3);
          bottom: 4px;
          left: 0;
          z-index: -1;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .form-group {
          margin-bottom: 25px;
        }
        .form-group.full-width {
          grid-column: span 2;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text-dark, #252525);
        }
        input, select, textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid var(--gray-200, #e5e7eb);
          border-radius: 0;
          font-family: 'Poppins', sans-serif;
          color: var(--text-dark, #252525);
          background-color: var(--white, #fff);
          transition: var(--transition, all 0.3s ease);
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--primary-color, #41644a);
          box-shadow: 0 0 0 3px rgba(65, 100, 74, 0.2);
        }
        .error-message {
          color: #d9534f;
          font-size: 0.9rem;
          margin-top: 5px;
        }
        .submit-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
        .submit-btn {
          background-color: var(--primary-color, #41644a);
          color: var(--white, #fff);
          border: none;
          padding: 12px 25px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition, all 0.3s ease);
          display: inline-flex;
          align-items: center;
          border-radius: 8px;
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .submit-btn i {
          margin-left: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: var(--secondary-color, #e9b384);
          color: var(--primary-dark, #263a2d);
          transform: translateY(-2px);
        }
        .cancel-btn {
          color: var(--text-light, #6b6b6b);
          background: none;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          transition: var(--transition, all 0.3s ease);
        }
        .cancel-btn:hover {
          color: var(--primary-color, #41644a);
        }
        .priority-options {
          display: flex;
          gap: 15px;
        }
        .priority-option {
          flex: 1;
          padding: 15px;
          border: 1px solid var(--gray-200, #e5e7eb);
          text-align: center;
          cursor: pointer;
          transition: var(--transition, all 0.3s ease);
        }
        .priority-option.selected {
          background-color: rgba(65, 100, 74, 0.1);
          border-color: var(--primary-color, #41644a);
        }
        .priority-option:hover {
          border-color: var(--primary-color, #41644a);
        }
        .priority-icon {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
        .low-priority .priority-icon { color: #5cb85c; }
        .medium-priority .priority-icon { color: #f0ad4e; }
        .high-priority .priority-icon { color: #d9534f; }
        .breadcrumbs {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        .breadcrumbs a {
          color: var(--text-light, #6b6b6b);
          text-decoration: none;
        }
        .breadcrumbs a:hover {
          color: var(--primary-color, #41644a);
        }
        .breadcrumbs i {
          margin: 0 10px;
          color: var(--text-light, #6b6b6b);
        }
        .breadcrumbs span {
          color: var(--primary-color, #41644a);
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
        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #c3e6cb;
        }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .form-group.full-width { grid-column: span 1; }
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
        }
      `}</style>

      {/* Navbar */}
      {/* <nav className="dashboard-navbar">
        <div className="logo">
          <i className="fas fa-home-user"></i>
          HomeManager
        </div>
        <div className="nav-links">
          <Link to="/dashboard"><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
          <Link to="/notifications"><i className="fas fa-bell"></i> Notifications</Link>
          <Link to="/settings"><i className="fas fa-cog"></i> Settings</Link>
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
        <div className="breadcrumbs">
          <Link to="/dashboard">Dashboard</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Request Maintenance</span>
        </div>

        <div className="maintenance-form-container">
          <h2 className="page-title">Request Maintenance Service</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-grid">
              {/* Service Type */}
              <div className="form-group">
                <label htmlFor="serviceType">Service Type*</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select service type</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC (Heating/Cooling)</option>
                  <option value="appliance">Appliance Repair</option>
                  <option value="structural">Structural Repair</option>
                  <option value="landscaping">Landscaping</option>
                  <option value="cleaning">Cleaning Service</option>
                  <option value="pest">Pest Control</option>
                  <option value="other">Other</option>
                </select>
                {errors.serviceType && <div className="error-message">{errors.serviceType}</div>}
              </div>

              {/* Room Location */}
              <div className="form-group">
                <label htmlFor="roomLocation">Room Location*</label>
                <select
                  id="roomLocation"
                  name="roomLocation"
                  value={form.roomLocation}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select room</option>
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
                {errors.roomLocation && <div className="error-message">{errors.roomLocation}</div>}
              </div>

              {/* Issue Title */}
              <div className="form-group full-width">
                <label htmlFor="issueTitle">Issue Title*</label>
                <input
                  type="text"
                  id="issueTitle"
                  name="issueTitle"
                  placeholder="e.g. Leaking Kitchen Faucet"
                  value={form.issueTitle}
                  onChange={handleChange}
                  required
                />
                {errors.issueTitle && <div className="error-message">{errors.issueTitle}</div>}
              </div>

              {/* Issue Description */}
              <div className="form-group full-width">
                <label htmlFor="issueDescription">Detailed Description*</label>
                <textarea
                  id="issueDescription"
                  name="issueDescription"
                  rows={5}
                  placeholder="Please describe the issue in detail..."
                  value={form.issueDescription}
                  onChange={handleChange}
                  required
                />
                {errors.issueDescription && <div className="error-message">{errors.issueDescription}</div>}
              </div>

              {/* Priority Level */}
              <div className="form-group full-width">
                <label>Priority Level*</label>
                <div className="priority-options">
                  {priorityOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={`priority-option ${opt.className} ${form.priorityLevel === opt.value ? "selected" : ""}`}
                      onClick={() => handlePrioritySelect(opt.value)}
                      tabIndex={0}
                      style={{ outline: "none" }}
                    >
                      <div className="priority-icon">
                        <i className={opt.icon}></i>
                      </div>
                      <h4>{opt.label}</h4>
                      <p>{opt.desc}</p>
                    </div>
                  ))}
                </div>
                {errors.priorityLevel && <div className="error-message">{errors.priorityLevel}</div>}
                <input type="hidden" name="priorityLevel" value={form.priorityLevel} />
              </div>

              {/* Preferred Date */}
              <div className="form-group">
                <label htmlFor="preferredDate">Preferred Service Date</label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={form.preferredDate}
                  onChange={handleChange}
                />
              </div>

              {/* Preferred Time */}
              <div className="form-group">
                <label htmlFor="preferredTime">Preferred Time</label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select preferred time</option>
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 8PM)</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>

              {/* Access Instructions */}
              <div className="form-group full-width">
                <label htmlFor="accessInstructions">Access Instructions</label>
                <textarea
                  id="accessInstructions"
                  name="accessInstructions"
                  rows={3}
                  placeholder="Instructions for accessing the property or specific area..."
                  value={form.accessInstructions}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="submit-section">
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request <i className="fas fa-paper-plane"></i>
                  </>
                )}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setForm(initialForm)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

MaintenanceRequest.propTypes = {
  email: PropTypes.string,
  setEmail: PropTypes.func.isRequired,
};

export default MaintenanceRequest;