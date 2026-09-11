import React, { useState, useEffect } from 'react';

const GasPrice = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Mock data for 12 months gas bills in BDT
  const monthlyGasBills = [
    { month: 'January', price: 1250, usage: '25 cubic meters', year: 2024 },
    { month: 'February', price: 1180, usage: '23 cubic meters', year: 2024 },
    { month: 'March', price: 1320, usage: '27 cubic meters', year: 2024 },
    { month: 'April', price: 1420, usage: '29 cubic meters', year: 2024 },
    { month: 'May', price: 1380, usage: '28 cubic meters', year: 2024 },
    { month: 'June', price: 1450, usage: '30 cubic meters', year: 2024 },
    { month: 'July', price: 1520, usage: '32 cubic meters', year: 2024 },
    { month: 'August', price: 1480, usage: '31 cubic meters', year: 2024 },
    { month: 'September', price: 1350, usage: '27 cubic meters', year: 2024 },
    { month: 'October', price: 1280, usage: '25 cubic meters', year: 2024 },
    { month: 'November', price: 1210, usage: '24 cubic meters', year: 2024 },
    { month: 'December', price: 1320, usage: '26 cubic meters', year: 2024 }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getCurrentMonth = () => {
    return monthNames[currentDate.getMonth()];
  };

  const getCurrentMonthData = () => {
    const currentMonth = getCurrentMonth();
    return monthlyGasBills.find(bill => bill.month === currentMonth);
  };

  const getAveragePrice = () => {
    const total = monthlyGasBills.reduce((sum, bill) => sum + bill.price, 0);
    return Math.round(total / monthlyGasBills.length);
  };

  const getHighestPrice = () => {
    return Math.max(...monthlyGasBills.map(bill => bill.price));
  };

  const getLowestPrice = () => {
    return Math.min(...monthlyGasBills.map(bill => bill.price));
  };

  const getPriceColor = (price) => {
    const avg = getAveragePrice();
    if (price > avg * 1.1) return '#e74c3c'; // Red for high
    if (price < avg * 0.9) return '#27ae60'; // Green for low
    return '#3498db'; // Blue for average
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  return (
    <div className="gas-price-container">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />

      <style>{`
        * {
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .gas-price-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 30px;
          color: white;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .page-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          font-weight: 400;
        }

        .current-month-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .current-month-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .current-month-title {
          font-size: 1.3rem;
          color: #2c3e50;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .current-price {
          font-size: 3rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .current-month-name {
          font-size: 1.5rem;
          color: #7f8c8d;
          margin-bottom: 15px;
          font-weight: 500;
        }

        .current-usage {
          font-size: 1.1rem;
          color: #95a5a6;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: 10px;
          display: block;
        }

        .stat-title {
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 8px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .monthly-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .month-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .month-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .month-card.current {
          border: 3px solid #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .month-card.current .month-name,
        .month-card.current .month-price,
        .month-card.current .month-usage {
          color: white;
        }

        .month-card.selected {
          border: 3px solid #e74c3c;
          background: #e74c3c;
          color: white;
        }

        .month-card.selected .month-name,
        .month-card.selected .month-price,
        .month-card.selected .month-usage {
          color: white;
        }

        .month-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 15px;
          text-align: center;
        }

        .month-price {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-align: center;
        }

        .month-usage {
          font-size: 0.9rem;
          color: #7f8c8d;
          text-align: center;
          margin-bottom: 10px;
        }

        .price-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .current-indicator {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #f39c12;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin-bottom: 20px;
          text-align: center;
        }

        .price-trend {
          text-align: center;
          margin-top: 15px;
          font-size: 0.9rem;
        }

        .trend-up {
          color: #e74c3c;
        }

        .trend-down {
          color: #27ae60;
        }

        .trend-same {
          color: #95a5a6;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .current-price {
            font-size: 2.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          .monthly-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }

          .month-price {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .monthly-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-fire"></i> Gas Price Tracker
          </h1>
          <p className="page-subtitle">Monthly gas consumption and pricing in Bangladesh (BDT)</p>
        </div>

        {/* Current Month Highlight */}
        <div className="current-month-card">
          <h2 className="current-month-title">
            <i className="fas fa-calendar-day"></i> Current Month
          </h2>
          <div className="current-price">
            {formatPrice(getCurrentMonthData()?.price || 0)}
          </div>
          <div className="current-month-name">{getCurrentMonth()}</div>
          <div className="current-usage">
            <i className="fas fa-chart-line"></i> {getCurrentMonthData()?.usage || 'N/A'}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-chart-bar stat-icon" style={{color: '#3498db'}}></i>
            <div className="stat-title">Average Monthly</div>
            <div className="stat-value">{formatPrice(getAveragePrice())}</div>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-arrow-up stat-icon" style={{color: '#e74c3c'}}></i>
            <div className="stat-title">Highest Bill</div>
            <div className="stat-value">{formatPrice(getHighestPrice())}</div>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-arrow-down stat-icon" style={{color: '#27ae60'}}></i>
            <div className="stat-title">Lowest Bill</div>
            <div className="stat-value">{formatPrice(getLowestPrice())}</div>
          </div>

          <div className="stat-card">
            <i className="fas fa-calculator stat-icon" style={{color: '#9b59b6'}}></i>
            <div className="stat-title">Annual Total</div>
            <div className="stat-value">
              {formatPrice(monthlyGasBills.reduce((sum, bill) => sum + bill.price, 0))}
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <h2 className="section-title">
          <i className="fas fa-calendar-alt"></i> Monthly Breakdown
        </h2>
        
        <div className="monthly-grid">
          {monthlyGasBills.map((bill, index) => {
            const isCurrentMonth = bill.month === getCurrentMonth();
            const isSelected = selectedMonth === bill.month;
            const priceColor = getPriceColor(bill.price);
            const avgPrice = getAveragePrice();
            
            let trendIcon = '';
            let trendClass = '';
            if (bill.price > avgPrice * 1.05) {
              trendIcon = 'fas fa-arrow-up';
              trendClass = 'trend-up';
            } else if (bill.price < avgPrice * 0.95) {
              trendIcon = 'fas fa-arrow-down';
              trendClass = 'trend-down';
            } else {
              trendIcon = 'fas fa-minus';
              trendClass = 'trend-same';
            }

            return (
              <div
                key={index}
                className={`month-card ${isCurrentMonth ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedMonth(isSelected ? null : bill.month)}
              >
                {isCurrentMonth && (
                  <div className="current-indicator">
                    <i className="fas fa-star"></i> Current
                  </div>
                )}
                
                <div 
                  className="price-indicator" 
                  style={{backgroundColor: priceColor}}
                  title={`Price indicator: ${bill.price > avgPrice ? 'Above' : bill.price < avgPrice ? 'Below' : 'At'} average`}
                ></div>
                
                <div className="month-name">{bill.month}</div>
                <div className="month-price" style={{color: isCurrentMonth || isSelected ? 'white' : priceColor}}>
                  {formatPrice(bill.price)}
                </div>
                <div className="month-usage">
                  <i className="fas fa-fire"></i> {bill.usage}
                </div>
                
                <div className={`price-trend ${trendClass}`}>
                  <i className={trendIcon}></i>
                  {bill.price > avgPrice * 1.05 && ' Above Average'}
                  {bill.price < avgPrice * 0.95 && ' Below Average'}
                  {bill.price >= avgPrice * 0.95 && bill.price <= avgPrice * 1.05 && ' Average Range'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GasPrice;