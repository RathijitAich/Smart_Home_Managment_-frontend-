import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";


const Registration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    houseName: "",
    country: "Bangladesh",
    city: "Chittagong",
    place: "Kotwali",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (form.password !== form.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  setLoading(true);
  try {
    const response = await fetch("https://homemanagement-backend.onrender.com/api/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (response.status === 201) {
      alert(data.message || "Registration successful!");
      navigate("/login");
    } else if (response.status === 409) {
      alert(data.message || "Email already registered.");
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (error) {
    alert("An error occurred while registering. Please try again later.");
  }
  setLoading(false);
};

  return (
    <div className="page-container">

      <div className="register-container">


        <div className="logo">
          <FaIcons.FaHome /> <span>HomeManager</span>
        </div>
        <h2>Create Your Account</h2>
        <p className="subtitle">
          Join HomeManager to organize your home efficiently
        </p>
        <form id="registerForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <FaIcons.FaUser />
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FaIcons.FaEnvelope />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FaIcons.FaLock />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <FaIcons.FaLock />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="houseName">House Name</label>
            <div className="input-wrapper">
              <FaIcons.FaHome />
              <input
                type="text"
                id="houseName"
                name="houseName"
                placeholder="Name your home"
                required
                value={form.houseName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <div className="input-wrapper">
                <FaIcons.FaGlobe />
                <select
                  id="country"
                  name="country"
                  required
                  value={form.country}
                  onChange={handleChange}
                >
                  <option value="Bangladesh">Bangladesh</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <div className="input-wrapper">
                <FaIcons.FaCity />
                <select
                  id="city"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                >
                  <option value="Chittagong">Chittagong</option>
                </select>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="place">Place</label>
            <div className="input-wrapper">
              <FaIcons.FaMapMarkerAlt />
              <select
                id="place"
                name="place"
                required
                value={form.place}
                onChange={handleChange}
              >
                <option value="Kotwali">Kotwali</option>
                <option value="Patharghata">Patharghata</option>
                <option value="Jamalkhan">Jamalkhan</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
        <p className="Worker-link">
          If your are a maintenance worker register for jobs <Link to="/Worker_regi">Click Here</Link>
        </p>
        
      </div>
      <div className="register-info">
        <h3>Benefits of joining HomeManager</h3>
        <ul className="benefits-list">
          <li>
            <FaIcons.FaCheckCircle /> Track all your home inventory in one place
          </li>
          <li>
            <FaIcons.FaCheckCircle /> Get reminders for maintenance and bills
          </li>
          <li>
            <FaIcons.FaCheckCircle /> Share access with family members
          </li>
          <li>
            <FaIcons.FaCheckCircle /> Generate reports and insights
          </li>
        </ul>
        <img
          src="https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="Home Management"
          className="info-image"
        />
      </div>
      <style>
        {`
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

          .page-container {
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    max-width: 1200px;
    margin: 0 auto;
}

/* Registration form container */
.register-container {
    flex: 1;
    padding: 2.5rem;
    background-color: var(--white);
}

/* Logo */
.logo {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1.25rem;
}

.logo i {
    font-size: 1.5rem;
    margin-right: 0.5rem;
}

/* Headers */
h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-dark);
}

.subtitle {
    color: var(--text-light);
    margin-bottom: 2rem;
}

/* Form elements */
form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.form-row .form-group {
    flex: 1;
}

label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-dark);
}

.input-wrapper {
    position: relative;
}

.input-wrapper i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-lighter);
}

input, select {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    color: var(--text-dark);
    background-color: var(--white);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input::placeholder, select::placeholder {
    color: var(--text-lighter);
}

input:focus, select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

/* Custom checkbox */
.terms-check {
    margin: 1rem 0;
}

.checkbox {
    display: flex;
    align-items: flex-start;
    position: relative;
    cursor: pointer;
    user-select: none;
}

.checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkmark {
    height: 20px;
    width: 20px;
    min-width: 20px;
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin-right: 0.75rem;
    margin-top: 2px;
    transition: all 0.2s ease;
}

.checkbox:hover .checkmark {
    border-color: var(--primary-color);
}

.checkbox input:checked ~ .checkmark {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}

.checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 7px;
    top: 3px;
    width: 6px;
    height: 11px;
    border: solid var(--white);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.checkbox input:checked ~ .checkmark:after {
    display: block;
}

.terms-text {
    font-size: 0.9rem;
    color: var(--text-light);
}

.terms-text a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
}

.terms-text a:hover {
    text-decoration: underline;
}

/* Register button */
.register-button {
    margin-top: 1rem;
    padding: 0.875rem;
    background-color: var(--primary-color);
    color: var(--white);
    border: none;
    border-radius: 8px;
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.register-button:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
}

.register-button:active {
    transform: translateY(0);
}

/* Login link */
.login-link {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-light);
}

.Worker-link {
    margin-top: 3.5rem;
    text-align: center;
    font-size: 1.2rem;
    color: #000000;
}

.login-link a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
}

.login-link a:hover {
    text-decoration: underline;
}

/* Right side info section */
.register-info {
    flex: 1;
    background-color: #f0f5ff;
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.register-info h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: var(--primary-color);
}

.benefits-list {
    list-style: none;
    margin-bottom: 2rem;
}

.benefits-list li {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    font-size: 1rem;
}

.benefits-list li i {
    color: var(--success);
    margin-right: 0.75rem;
    font-size: 1.1rem;
}

.info-image {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
    box-shadow: var(--shadow);
    align-self: center;
}

/* Responsive styles */
@media (max-width: 992px) {
    .page-container {
        flex-direction: column;
    }
    
    .register-info {
        order: -1;
        padding: 2rem;
    }
    
    .info-image {
        max-width: 300px;
        margin-bottom: 1rem;
    }
}

@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        gap: 1rem;
    }
    
    .register-container, .register-info {
        padding: 1.5rem;
    }
}

@media (max-width: 480px) {
    h2 {
        font-size: 1.5rem;
    }
    
    .subtitle {
        font-size: 0.9rem;
    }
    
    .register-button {
        padding: 0.75rem;
    }
}
        `}
      </style>
    </div>
  );
};

export default Registration;