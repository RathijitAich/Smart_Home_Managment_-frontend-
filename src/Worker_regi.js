import React, { useState } from "react";
import {useNavigate} from "react-router-dom";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  skill: "",
  address: "",
  password: "",
  status: "available",
  experience: "",
  rating: "",
};

const skillOptions = [
  "plumbing",
  "electrical",
  "hvac",
  "appliance",
  "structural",
  "landscaping",
  "cleaning",
  "pest",
  "carpentry",
  "painting",
  "roofing",
  "other"
];

const statusOptions = [
  "available",
  "In Job",
  "Not Available",
];

function MaintenanceWorkerForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.phone) newErrors.phone = "Phone is required";
    if (!form.skill) newErrors.skill = "Skill is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.password) newErrors.password = "Password is required";
    if (form.rating && (isNaN(form.rating) || form.rating < 0 || form.rating > 5)) {
      newErrors.rating = "Rating must be between 0 and 5";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("https://homemanagement-backend.onrender.com/api/registration/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: form.rating ? parseFloat(form.rating) : null
        }),
      });

      if (response.ok) {
        alert("Maintenance worker registered successfully!");
        setForm(initialForm);
        // Redirect to main page or another page after successful registration
        navigate("/login");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Registration failed"}`);
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* FontAwesome and Google Fonts */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" />
      
      <style>{`
        :root {
          --primary-color: #4361ee;
          --primary-dark: #3a0ca3;
          --primary-light: #4895ef;
          --text-dark: #1f2937;
          --text-light: #6b7280;
          --text-lighter: #9ca3af;
          --background: #f9fafb;
          --white: #ffffff;
          --border-color: #e5e7eb;
          --success: #10b981;
          --error: #ef4444;
          --gray-100: #f3f4f6;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Poppins', sans-serif;
          background-color: var(--background);
          color: var(--text-dark);
          line-height: 1.5;
        }

        .worker-form-container {
          max-width: 800px;
          margin: 40px auto;
          background-color: var(--white);
          padding: 40px;
          border-radius: 12px;
          box-shadow: var(--shadow);
        }

        .page-title {
          margin-bottom: 30px;
          position: relative;
          display: inline-block;
          font-size: 2rem;
          color: var(--primary-color);
        }

        .page-title::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 4px;
          background: linear-gradient(to right, var(--primary-color), var(--primary-light));
          bottom: -5px;
          left: 0;
          border-radius: 2px;
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
          color: var(--text-dark);
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-lighter);
        }

        input, select, textarea {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          color: var(--text-dark);
          background-color: var(--white);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
        }

        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-lighter);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: var(--primary-color);
        }

        .error-message {
          color: var(--error);
          font-size: 0.9rem;
          margin-top: 5px;
        }

        .submit-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 30px;
        }

        .submit-btn {
          background: linear-gradient(to right, var(--primary-color), var(--primary-light));
          color: var(--white);
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          font-size: 1rem;
        }

        .submit-btn i {
          margin-left: 8px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(67, 97, 238, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .cancel-btn {
          color: var(--text-light);
          background: none;
          border: 1px solid var(--border-color);
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .info-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .info-section h3 {
          margin-bottom: 10px;
        }

        .required-mark {
          color: var(--error);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-group.full-width {
            grid-column: span 1;
          }

          .worker-form-container {
            margin: 20px;
            padding: 20px;
          }

          .submit-section {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>

      <div className="worker-form-container">
        <div className="info-section">
          <h3><i className="fas fa-info-circle"></i> Join Our Maintenance Team</h3>
          <p>Register as a maintenance worker and start accepting service requests from homeowners in your area.</p>
        </div>

        <h2 className="page-title">
          <i className="fas fa-user-plus"></i> Worker Registration
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name <span className="required-mark">*</span></label>
              <div className="input-wrapper">
                <i className="fas fa-user input-icon"></i>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address <span className="required-mark">*</span></label>
              <div className="input-wrapper">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone">Phone Number <span className="required-mark">*</span></label>
              <div className="input-wrapper">
                <i className="fas fa-phone input-icon"></i>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>

            {/* Skill */}
            <div className="form-group">
              <label htmlFor="skill">Primary Skill <span className="required-mark">*</span></label>
              <div className="input-wrapper">
                <i className="fas fa-tools input-icon"></i>
                <select
                  id="skill"
                  name="skill"
                  value={form.skill}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your primary skill</option>
                  {skillOptions.map(skill => (
                    <option key={skill} value={skill}>
                      {skill.charAt(0).toUpperCase() + skill.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {errors.skill && <div className="error-message">{errors.skill}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password <span className="required-mark">*</span></label>
              <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <i 
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Availability Status</label>
              <div className="input-wrapper">
                <i className="fas fa-signal input-icon"></i>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="form-group full-width">
              <label htmlFor="address">Address <span className="required-mark">*</span></label>
              <div className="input-wrapper">
                <i className="fas fa-map-marker-alt input-icon"></i>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Enter your full address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.address && <div className="error-message">{errors.address}</div>}
            </div>

            {/* experience */}
            <div className="form-group full-width">
              <label htmlFor="experience">Experience Details</label>
              <div className="input-wrapper">
                <i className="fas fa-briefcase input-icon"></i>
                <textarea
                  id="experience"
                  name="experience"
                  rows={4}
                  placeholder="Describe your work experience, certifications, and expertise..."
                  value={form.experience}
                  onChange={handleChange}
                  style={{ paddingTop: '12px' }}
                />
              </div>
            </div>

            {/* Rating */}
            {/* <div className="form-group">
              <label htmlFor="rating">Initial Rating (0-5)</label>
              <div className="input-wrapper">
                <i className="fas fa-star input-icon"></i>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  placeholder="Enter rating (optional)"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={handleChange}
                />
              </div>
              {errors.rating && <div className="error-message">{errors.rating}</div>}
            </div> */}
          </div>

          <div className="submit-section">
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Registering...
                </>
              ) : (
                <>
                  Register Worker <i className="fas fa-user-check"></i>
                </>
              )}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setForm(initialForm)}
              disabled={submitting}
            >
              <i className="fas fa-times"></i> Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaintenanceWorkerForm;