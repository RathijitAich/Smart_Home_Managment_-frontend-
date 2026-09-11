import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./Navbar";
import Login from "./Login";
import LandingPage from "./LandingPage";
import Registration from "./Registration";
import MainPage from "./MainPage";
import RequestMain from "./RequestMain";
import ReviewWorker from './ReviewWorker';

import Worker_regi from "./Worker_regi";
import WorkerLogin from './Worker_login';
import WorkerDashboard from './WorkerDashboard';
import ViewJobs from './ViewJobs';
import CurrentJob from './CurrentJob';
import Home from './pages/Home';
import Electricity from './pages/Electricity';
import RoomSetup from './pages/RoomSetup';
import Groceries from './pages/Groceries';
import BillReminders from './pages/BillReminders';
import Approve from './Approve';
import Chat from './Chat_experiment';
import Gas from './gas';


import JobHistory from './JobHistory'; 

// src/App.jsx or wherever your routes are defined
import PredictBills from './pages/PredictBills';
import Prediction from './Prediction_Electricity';

// Component to conditionally render Navbar
const ConditionalNavbar = ({ email, setEmail, worker_email, setWorkerEmail }) => {
  const location = useLocation();
  
  // Pages where navbar SHOULD be shown
  const navbarPaths = [
    '/main',
    '/Req_main', 
    '/worker-dashboard',
    '/show-jobs',
    '/current-jobs',
    '/Approve',
    '/chat',
    '/review-worker',
    '/home',
    '/electricity',
    '/room-setup',
    '/groceries',
    '/bill-reminders',
    '/predict-bills',
    '/electricity-prediction',
    '/job-history',
    '/gas-prediction'
  ];
  
  const shouldShowNavbar = navbarPaths.includes(location.pathname);
  
  return shouldShowNavbar ? (
    <Navbar 
      email={email} 
      setEmail={setEmail} 
      worker_email={worker_email} 
      setWorkerEmail={setWorkerEmail} 
    />
  ) : null;
};

function App() {
  // Email

  //background color for all pages

  useEffect(() => {
    document.body.style.background = "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)";
    return () => {
      document.body.style.background = "";
    };
  }, []);
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  useEffect(() => {
    localStorage.setItem("email", email);
  }, [email]);

  const [worker_email, setWorkerEmail] = useState(() => localStorage.getItem("worker_email") || "");
  useEffect(() => {
    localStorage.setItem("worker_email", worker_email);
  }, [worker_email]);

  return (
    <Router>
      <div className="app-container">
        {/* Conditional Navbar */}
        <ConditionalNavbar 
          email={email} 
          setEmail={setEmail} 
          worker_email={worker_email} 
          setWorkerEmail={setWorkerEmail} 
        />
        
        {/* Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login email={email} setEmail={setEmail}/>} />
            <Route path="/register" element={<Registration />} />

            <Route path="/main" element={<MainPage email={email} setEmail={setEmail} worker_email={worker_email} />} />
            <Route path="/Req_main" element={<RequestMain email={email} setEmail={setEmail} />} />

            <Route path="/worker_regi" element={<Worker_regi/>} />
            <Route path="/Worker_login" element={<WorkerLogin  worker_email={worker_email} setWorkerEmail={setWorkerEmail} />} />
            <Route path="/worker-dashboard" element={<WorkerDashboard worker_email={worker_email} setWorkerEmail={setWorkerEmail} />} />
            <Route path="/show-jobs" element={<ViewJobs worker_email={worker_email} setWorkerEmail={setWorkerEmail} />} />
            <Route path="/current-jobs" element={<CurrentJob worker_email={worker_email} setWorkerEmail={setWorkerEmail} />} />

            <Route path="/Approve" element={<Approve email={email} setEmail={setEmail} />} />
            <Route path ="/chat" element={<Chat email={email} worker_email={worker_email} />} />
            <Route path="/review-worker" element={<ReviewWorker email={email} setEmail={setEmail} />} />
            
            <Route path="/home" element={<Home />} />
            <Route path="/electricity" element={<Electricity />} />
            <Route path="/room-setup" element={<RoomSetup email={email} setEmail={setEmail} />} />
            <Route path="/groceries" element={<Groceries />} />
            <Route path="/bill-reminders" element={<BillReminders />} />
            <Route path="/predict-bills" element={<PredictBills />} />
            <Route path="/electricity-prediction" element={<Prediction email={email} setEmail={setEmail} />} />
            <Route path="/job-history" element={<JobHistory worker_email={worker_email} setWorkerEmail={setWorkerEmail} />} />
            <Route path = "/gas-prediction" element ={ <Gas/> } />
          </Routes>
        </div>
      </div>
      
      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          flex: 1;
        }
        
        /* Ensure navbar stays on top */
        .dashboard-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        /* Full height for landing page */
        .landing-page {
          min-height: 100vh;
        }
      `}</style>
    </Router>
  );
}

export default App;