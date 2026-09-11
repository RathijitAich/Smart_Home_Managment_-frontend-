import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import PropTypes from 'prop-types';

const notificationStyles = {
  base: {
    position: "fixed",
    top: 20,
    right: 20,
    padding: "12px 20px",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transform: "translateX(150%)",
    transition: "transform 0.3s ease",
    zIndex: 1000,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  show: { transform: "translateX(0)" },
  success: { backgroundColor: "#10b981" },
  error: { backgroundColor: "#ef4444" },
};


export default function WorkerLogin({worker_email, setWorkerEmail}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const response = await fetch("https://homemanagement-backend.onrender.com/api/login/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log("data sent to backend:", { email, password });

      if (response.status === 200) {
        setNotification({ type: "success", message: "Login successful!" });
        setWorkerEmail(email);
        localStorage.setItem("worker_email", email);
        setTimeout(() => {
          navigate("/worker-dashboard");
        }, 1000);
      } else if (response.status === 401) {
        setNotification({
          type: "error",
          message: data.message || "Invalid credentials. Please check your email and password.",
        });
      } else if (response.status === 404) {
        setNotification({
          type: "error",
          message: data.message || "Worker account not found.",
        });
      } else {
        setNotification({
          type: "error",
          message: data.message || "Login failed. Please try again.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "Something went wrong. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="page-container" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="login-container">
        <div className="logo">
          <FaIcons.FaTools />
          <span>WorkerPortal</span>
        </div>

        <h2>Worker Login</h2>
        <p className="subtitle">Access your maintenance worker dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-icon">
              <FaIcons.FaEnvelope />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Work Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="input"
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <FaIcons.FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="input"
            />
            <div
              className="toggle-password"
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaIcons.FaEyeSlash /> : <FaIcons.FaEye />}
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner"
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: "50%",
                    borderTopColor: "#fff",
                    animation: "spin 0.8s linear infinite",
                    marginRight: 10,
                    display: "inline-block",
                  }}
                ></span>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <FaIcons.FaArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <p className="register-link">
          Not registered as a worker? <Link to="/worker_regi">Join our team</Link>
        </p>
        
        <p className="homeowner-link">
          Are you a homeowner? <Link to="/login">Homeowner Login</Link>
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className="notification"
          style={{
            ...notificationStyles.base,
            ...(notification.type === "success"
              ? notificationStyles.success
              : notificationStyles.error),
            ...(notification ? notificationStyles.show : {}),
          }}
        >
          {notification.type === "success" ? (
            <FaIcons.FaCheckCircle />
          ) : (
            <FaIcons.FaExclamationCircle />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Styles */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          :root {
            --primary-color: #4361ee;
            --primary-light: #4895ef;
            --primary-dark: #3a0ca3;
            --worker-color: #059669;
            --worker-light: #10b981;
            --worker-dark: #047857;
            --background: #f0f9ff;
            --card-bg: rgba(255, 255, 255, 0.95);
            --text-dark: #1f2937;
            --text-light: #6b7280;
            --white: #ffffff;
            --border-color: #e5e7eb;
            --shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            --gradient-start: #059669;
            --gradient-end: #4361ee;
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
            min-height: 100vh;
            line-height: 1.5;
          }

          .page-container {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            position: relative;
            overflow: hidden;
          }

          /* Background Shapes Animation */
          .background-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: -1;
          }

          .shape {
            position: absolute;
            border-radius: 50%;
            animation: float 15s ease-in-out infinite;
          }

          .shape-1 {
            width: 300px;
            height: 300px;
            top: -100px;
            right: -100px;
            background: linear-gradient(to bottom right, var(--worker-light), var(--worker-dark));
            opacity: 0.3;
          }

          .shape-2 {
            width: 200px;
            height: 200px;
            bottom: -80px;
            left: -80px;
            background: linear-gradient(to top right, var(--primary-color), var(--worker-color));
            opacity: 0.2;
            animation-delay: 3s;
          }

          .shape-3 {
            width: 150px;
            height: 150px;
            top: 40%;
            right: 10%;
            background: linear-gradient(to top left, #f97316, var(--worker-light));
            opacity: 0.1;
            animation-delay: 1s;
          }

          .shape-4 {
            width: 180px;
            height: 180px;
            top: 60%;
            left: 10%;
            background: linear-gradient(to bottom left, var(--primary-light), var(--worker-color));
            opacity: 0.1;
            animation-delay: 4s;
          }

          @keyframes float {
            0% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(10px, -10px) rotate(5deg);
            }
            50% {
              transform: translate(0, 15px) rotate(0deg);
            }
            75% {
              transform: translate(-10px, -5px) rotate(-5deg);
            }
            100% {
              transform: translate(0, 0) rotate(0deg);
            }
          }

          /* Login Container */
          .login-container {
            background: var(--card-bg);
            width: 100%;
            max-width: 450px;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: var(--shadow);
            backdrop-filter: blur(10px);
            animation: fadeIn 0.8s ease-in-out forwards;
            border: 1px solid rgba(5, 150, 105, 0.1);
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Logo */
          .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--worker-color);
          }

          .logo i {
            font-size: 1.8rem;
            margin-right: 0.5rem;
          }

          /* Headers */
          h2 {
            font-size: 1.8rem;
            font-weight: 600;
            text-align: center;
            margin-bottom: 0.5rem;
            color: var(--worker-dark);
          }

          .subtitle {
            text-align: center;
            color: var(--text-light);
            margin-bottom: 2rem;
          }

          /* Form Elements */
          form {
            margin-top: 1.5rem;
          }

          .input-group {
            position: relative;
            margin-bottom: 1.5rem;
          }

          .input-icon {
            position: absolute;
            top: 50%;
            left: 15px;
            transform: translateY(-50%);
            color: var(--text-light);
          }

          .toggle-password {
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
            color: var(--text-light);
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .toggle-password:hover {
            color: var(--worker-color);
          }

          input {
            width: 100%;
            padding: 12px 15px 12px 45px;
            border: 1px solid var(--border-color);
            border-radius: 50px;
            font-family: 'Poppins', sans-serif;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          input:focus {
            outline: none;
            border-color: var(--worker-color);
            box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2);
          }

          input::placeholder {
            color: #adb5bd;
          }

          /* Checkbox Styling */
          .options-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .remember-me {
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--text-light);
          }

          .remember-me input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
          }

          .checkmark {
            height: 18px;
            width: 18px;
            background-color: var(--white);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            margin-right: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }

          .remember-me:hover .checkmark {
            border-color: var(--worker-color);
          }

          .remember-me input:checked ~ .checkmark {
            background-color: var(--worker-color);
            border-color: var(--worker-color);
          }

          .checkmark:after {
            content: '';
            position: absolute;
            display: none;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }

          .remember-me input:checked ~ .checkmark:after {
            display: block;
          }

          .forgot-password {
            color: var(--worker-color);
            font-size: 0.9rem;
            text-decoration: none;
            transition: all 0.3s ease;
          }

          .forgot-password:hover {
            text-decoration: underline;
          }

          /* Button Styling */
          .login-button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
            color: var(--white);
            border: none;
            border-radius: 50px;
            font-family: 'Poppins', sans-serif;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s ease;
            overflow: hidden;
            position: relative;
          }

          .login-button span {
            z-index: 1;
            transition: all 0.3s ease;
          }

          .login-button i {
            margin-left: 8px;
            z-index: 1;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateX(-10px);
          }

          .login-button:hover i {
            opacity: 1;
            transform: translateX(0);
          }

          .login-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(5, 150, 105, 0.3);
          }

          .login-button:active {
            transform: translateY(0);
          }

          .login-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          /* Divider */
          .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 1.5rem 0;
          }

          .divider::before,
          .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid var(--border-color);
          }

          .divider span {
            padding: 0 10px;
            color: var(--text-light);
            font-size: 0.9rem;
          }

          /* Register Links */
          .register-link, .homeowner-link {
            text-align: center;
            font-size: 0.9rem;
            color: var(--text-light);
            margin-bottom: 1rem;
          }

          .register-link a, .homeowner-link a {
            color: var(--worker-color);
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s ease;
          }

          .register-link a:hover, .homeowner-link a:hover {
            text-decoration: underline;
          }

          /* Responsive Styles */
          @media screen and (max-width: 500px) {
            .login-container {
              padding: 2rem;
            }
            
            h2 {
              font-size: 1.6rem;
            }
            
            .options-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.75rem;
            }
          }
        `}
      </style>
    </div>
  );
}
WorkerLogin.propTypes = {
  worker_email: PropTypes.string.isRequired,
  setWorkerEmail: PropTypes.func.isRequired,
};