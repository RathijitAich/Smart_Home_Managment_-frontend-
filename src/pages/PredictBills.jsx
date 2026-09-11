import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PredictBills.css';

const bills = [
  {
    type: 'Electricity',
    description: 'Estimate your electricity usage and future charges with AI-powered predictions.',
    icon: '⚡',
    route: '/electricity-prediction'
  },
  {
    type: 'Gas',
    description: 'Analyze gas usage patterns and predict monthly costs with precision.',
    icon: '🔥',
    route: '/gas-prediction'
  },
];

const PredictBills = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const handleGetStarted = (route) => {
    navigate(route);
  };

  return (
    <div className="predict-wrapper">
      <div className="background-elements">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>
      
      <div className="grid-pattern"></div>
      
      <div className="content-container">
        <div className="predict-header">
          <h1>Predict Your Bills</h1>
          
          <p>
            Track and analyze your utility expenses 
            <span className="highlight-smart"> smartly</span> and 
            <span className="highlight-efficient"> efficiently</span>
          </p>
          
          <div className="decorative-bars">
            <div className="bar bar-1"></div>
            <div className="bar bar-2"></div>
            <div className="bar bar-3"></div>
          </div>
        </div>

        <div className="card-grid">
          {bills.map((bill, index) => (
            <div
              key={bill.type}
              className={`bill-card ${hoveredCard === index ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="card-glow"></div>
              
              <div className="card-content">
                <div className="card-gradient"></div>
                
                <div className="emoji-container">
                  <div className="emoji-glow"></div>
                  <div className="emoji-background">
                    <span className="emoji-icon">{bill.icon}</span>
                  </div>
                </div>
                
                <div className="card-text">
                  <h2>{bill.type} Bill</h2>
                  <p>{bill.description}</p>
                  
                  <button 
                    className="start-btn"
                    onClick={() => handleGetStarted(bill.route)}
                  >
                    <span>Get Started</span>
                    <svg className="btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="btn-overlay"></div>
                  </button>
                </div>
                
                <div className="floating-particles">
                  <div className="particle particle-1"></div>
                  <div className="particle particle-2"></div>
                  <div className="particle particle-3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="footer">
          <div className="footer-indicators">
            <div className="indicator">
              <span className="indicator-dot dot-green"></span>
              <span>AI Powered</span>
            </div>
            <div className="indicator">
              <span className="indicator-dot dot-blue"></span>
              <span>Accurate Predictions</span>
            </div>
            <div className="indicator">
              <span className="indicator-dot dot-purple"></span>
              <span>Save Money</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictBills;