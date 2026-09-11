import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const Prediction_Electricity = ({ email, setEmail }) => {
  const navigate = useNavigate();
  const [roomSetup, setRoomSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Fetch room setup data on component mount
  useEffect(() => {
    loadFromDatabase();
  }, []);

  // Get prediction whenever roomSetup change
  useEffect(() => {
    if (roomSetup && roomSetup.rooms) {
      getPrediction();
    }
  }, [roomSetup]);

  const loadFromDatabase = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
      
      if (!userEmail) {
        setError('Please log in to view electricity predictions');
        setLoading(false);
        return;
      }

      const response = await fetch(`https://homemanagement-backend.onrender.com/api/room-setup/setup/${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No room setup found. Please configure your rooms first.');
        } else {
          throw new Error('Failed to load room setup');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (!data.rooms || data.rooms.length === 0) {
        setError('No rooms found. Please configure your rooms first.');
        setLoading(false);
        return;
      }

      setRoomSetup(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error loading room setup:', err);
      setError('Failed to load room setup. Please try again.');
      setLoading(false);
    }
  };

  const getPrediction = async () => {
    if (!roomSetup || !roomSetup.rooms) return;

    try {
      setPredictionLoading(true);
      
      // Get current month
      const currentMonth = new Date().toLocaleString('default', { month: 'long' });
      
      // Prepare data for Python backend
      const devicesData = [];
      
      roomSetup.rooms.forEach(roomData => {
        const devices = roomData.devices || [];
        devices.forEach(device => {
          devicesData.push({
            watts: parseFloat(device.watts),
            hours: parseFloat(device.hoursPerDay),
            quantity: parseInt(device.quantity),
            device_name: device.deviceName,
            room_name: roomData.room.roomName,
            month: currentMonth
          });
        });
      });

      console.log('Sending data to Python backend:', devicesData);
      

      // Send data to Python Flask backend


      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(devicesData)
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction from AI model');
      }

      const predictionData = await response.json();
      console.log('Received prediction data:', predictionData);
      
      setPrediction(predictionData);
      setPredictionLoading(false);
    } catch (err) {
      console.error('Error getting prediction:', err);
      setError('Failed to get AI prediction. Please try again.');
      setPredictionLoading(false);
    }
  };

  const organizeDevicesByRoom = () => {
    if (!roomSetup || !prediction) return [];

    const roomsMap = new Map();
    
    // Initialize rooms
    roomSetup.rooms.forEach(roomData => {
      roomsMap.set(roomData.room.roomName, {
        roomName: roomData.room.roomName,
        roomType: roomData.room.roomType,
        devices: [],
        totalCost: 0
      });
    });

    // Handle different response formats
    if (prediction.device_predictions && Array.isArray(prediction.device_predictions)) {
      // New format with device_predictions array
      prediction.device_predictions.forEach(devicePred => {
        const roomName = devicePred.room_name;
        const deviceName = devicePred.device_name;
        
        if (roomsMap.has(roomName)) {
          const room = roomsMap.get(roomName);
          room.devices.push({
            name: deviceName,
            predictedBill: devicePred.predicted_bill
          });
          room.totalCost += devicePred.predicted_bill;
        }
      });
    } else if (prediction.predicted_bill) {
      // Old format with single predicted_bill - distribute across all devices
      const totalBill = prediction.predicted_bill;
      let totalDevices = 0;
      
      // Count total devices
      roomSetup.rooms.forEach(roomData => {
        totalDevices += (roomData.devices || []).length;
      });
      
      const avgBillPerDevice = totalDevices > 0 ? totalBill / totalDevices : 0;
      
      // Distribute the bill across all devices
      roomSetup.rooms.forEach(roomData => {
        const devices = roomData.devices || [];
        const roomName = roomData.room.roomName;
        
        if (roomsMap.has(roomName)) {
          const room = roomsMap.get(roomName);
          devices.forEach(device => {
            room.devices.push({
              name: device.deviceName,
              predictedBill: avgBillPerDevice
            });
            room.totalCost += avgBillPerDevice;
          });
        }
      });
    } else {
      // Fallback - no prediction data
      console.warn('No prediction data available:', prediction);
      
      roomSetup.rooms.forEach(roomData => {
        const devices = roomData.devices || [];
        const roomName = roomData.room.roomName;
        
        if (roomsMap.has(roomName)) {
          const room = roomsMap.get(roomName);
          devices.forEach(device => {
            room.devices.push({
              name: device.deviceName,
              predictedBill: 0
            });
          });
        }
      });
    }

    return Array.from(roomsMap.values());
  };

  const roomsWithPredictions = organizeDevicesByRoom();

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '2rem',
      color: '#ffffff',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      position: 'relative',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '1rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    subtitle: {
      fontSize: '1.2rem',
      opacity: 0.9,
      marginBottom: '2rem',
    },
    backBtn: {
      position: 'absolute',
      top: '0',
      left: '0',
      background: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      fontWeight: '500',
    },
    aiLabel: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #00ff88, #00ccff)',
      color: '#000',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    summaryCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      textAlign: 'center',
    },
    summaryTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginTop: '1rem',
    },
    summaryItem: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    summaryValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#ffd700',
      marginBottom: '0.5rem',
    },
    summaryLabel: {
      fontSize: '0.9rem',
      opacity: 0.8,
    },
    roomsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem',
    },
    roomCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'transform 0.3s ease',
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    },
    roomName: {
      fontSize: '1.3rem',
      fontWeight: '600',
    },
    roomType: {
      fontSize: '0.9rem',
      opacity: 0.7,
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
    },
    roomCost: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#ffd700',
    },
    devicesTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
    },
    tableHeader: {
      background: 'rgba(255, 255, 255, 0.1)',
      fontWeight: '600',
      padding: '0.75rem',
      textAlign: 'left',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      fontSize: '0.9rem',
    },
    tableCell: {
      padding: '0.75rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '0.9rem',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontSize: '1.2rem',
    },
    predictionLoadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      fontSize: '1.2rem',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '15px',
      margin: '2rem 0',
    },
    errorContainer: {
      background: 'rgba(255, 0, 0, 0.1)',
      border: '1px solid rgba(255, 0, 0, 0.3)',
      borderRadius: '15px',
      padding: '2rem',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto',
    },
    errorTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#ff6b6b',
    },
    refreshBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      marginTop: '1rem',
      marginLeft: '1rem',
      transition: 'all 0.3s ease',
    },
    setupBtn: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: '#ffffff',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '1.1rem',
      fontWeight: '600',
      marginTop: '1rem',
      transition: 'all 0.3s ease',
    },
    retryBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      marginTop: '1rem',
      transition: 'all 0.3s ease',
    },
    noDataMessage: {
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '15px',
      marginTop: '2rem',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div>Loading room setup from database...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button 
            style={styles.backBtn}
            onClick={() => navigate('/predict-bills')}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ← Back
          </button>
          <h1 style={styles.title}>⚡ Electricity Prediction</h1>
        </div>
        
        <div style={styles.errorContainer}>
          <div style={styles.errorTitle}>⚠️ {error}</div>
          <p>To get AI-powered electricity predictions, you need to set up your rooms and devices first.</p>
          {error.includes('AI prediction') ? (
            <button 
              style={styles.retryBtn}
              onClick={getPrediction}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              🔄 Retry AI Prediction
            </button>
          ) : (
            <button 
              style={styles.setupBtn}
              onClick={() => navigate('/room-setup')}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🏠 Setup Rooms & Devices
            </button>
          )}
          <button 
            style={styles.refreshBtn}
            onClick={loadFromDatabase}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    );
  }

  if (predictionLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button 
            style={styles.backBtn}
            onClick={() => navigate('/predict-bills')}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ← Back
          </button>
          <h1 style={styles.title}>⚡ Electricity Prediction</h1>
          <div style={styles.aiLabel}>🤖 AI Powered</div>
        </div>
        
        <div style={styles.predictionLoadingContainer}>
          <div>🤖 AI is analyzing your devices and predicting electricity costs...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          style={styles.backBtn}
          onClick={() => navigate('/predict-bills')}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          ← Back
        </button>
        <h1 style={styles.title}>⚡ Electricity Prediction</h1>
        <div style={styles.aiLabel}>🤖 AI Powered Prediction</div>
        <p style={styles.subtitle}>Machine learning model predicts your monthly electricity bill</p>
      </div>

      {prediction && (
        <div style={styles.summaryCard}>
          <h2 style={styles.summaryTitle}>AI Prediction Summary</h2>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>
                BDT {prediction.total_monthly_bill || prediction.predicted_bill || 0}
              </div>
              <div style={styles.summaryLabel}>Predicted Monthly Bill</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>
                {prediction.device_predictions 
                  ? prediction.device_predictions.length 
                  : roomSetup.rooms.reduce((total, room) => total + (room.devices?.length || 0), 0)
                }
              </div>
              <div style={styles.summaryLabel}>Devices Analyzed</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>{roomSetup.rooms.length}</div>
              <div style={styles.summaryLabel}>Rooms</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>
                {(() => {
                  const totalBill = prediction.total_monthly_bill || prediction.predicted_bill || 0;
                  const totalDevices = prediction.device_predictions 
                    ? prediction.device_predictions.length 
                    : roomSetup.rooms.reduce((total, room) => total + (room.devices?.length || 0), 0);
                  return totalDevices > 0 ? `BDT ${(totalBill / totalDevices).toFixed(2)}` : 'BDT 0.00';
                })()}
              </div>
              <div style={styles.summaryLabel}>Avg Cost per Device</div>
            </div>
          </div>
        </div>
      )}

      {roomsWithPredictions.length > 0 ? (
        <div style={styles.roomsContainer}>
          {roomsWithPredictions.map((room, index) => (
            <div key={index} style={styles.roomCard}>
              <div style={styles.roomHeader}>
                <div>
                  <div style={styles.roomName}>{room.roomName}</div>
                  <div style={styles.roomType}>{room.roomType}</div>
                </div>
                <div style={styles.roomCost}>BDT {room.totalCost.toFixed(2)}</div>
              </div>
              
              {room.devices.length > 0 ? (
                <table style={styles.devicesTable}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Device</th>
                      <th style={styles.tableHeader}>AI Predicted Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.devices.map((device, deviceIndex) => (
                      <tr key={deviceIndex}>
                        <td style={styles.tableCell}>{device.name}</td>
                        <td style={styles.tableCell}>BDT {device.predictedBill.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.noDataMessage}>
                  No devices found in this room
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noDataMessage}>
          <h3>No prediction data available</h3>
          <p>Please ensure your rooms have devices configured and try again.</p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          style={styles.retryBtn}
          onClick={getPrediction}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          🤖 Get New AI Prediction
        </button>
      </div>
    </div>
  );
};

Prediction_Electricity.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
};

export default Prediction_Electricity;