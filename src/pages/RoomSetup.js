import React, { useState, useEffect } from 'react';
import { data, useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

const RoomSetup = ({email, setEmail}) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loadedRooms, setLoadedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Room types extracted from device templates
  const roomTypes = ["Bedroom", "Kitchen", "Bathroom", "Drawing Room", "Living Room", "Dining Room"];

  // Load from database on component mount
  useEffect(() => {
    loadFromDatabase();
  }, []);

  // Save rooms to localStorage whenever rooms state changes
  useEffect(() => {
    localStorage.setItem('homeRooms', JSON.stringify(rooms));
  }, [rooms]);

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: '',
      type: '',
      devices: [],
      isNew: true,
      isSaved: false
    };
    setRooms([...rooms, newRoom]);
  };

  const updateRoom = (index, field, value) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  const addDevice = (roomIndex) => {
    const updated = [...rooms];
    updated[roomIndex].devices.push({
      id: Date.now(),
      name: '',
      watts: '',
      hours: '',
      quantity: 1,
      isNew: true
    });
    setRooms(updated);
  };

  const updateDevice = (roomIndex, deviceIndex, field, value) => {
    const updated = [...rooms];
    updated[roomIndex].devices[deviceIndex][field] = value;
    setRooms(updated);
  };

  const removeDevice = (roomIndex, deviceIndex) => {
    const updated = [...rooms];
    updated[roomIndex].devices.splice(deviceIndex, 1);
    setRooms(updated);
  };

  const removeRoom = async (index) => {
    const room = rooms[index];
    
    // If room is saved in database, delete from backend
    if (room.isSaved) {
      try {
        const response = await fetch(`https://homemanagement-backend.onrender.com/api/room-setup/room/${encodeURIComponent(room.name)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete room');
        }

        alert('Room and associated devices deleted successfully from database!');
      } catch (error) {
        console.error('Error deleting room:', error);
        alert(`Failed to delete room: ${error.message}`);
        return; // Don't remove from frontend if backend deletion failed
      }
    }

    // Remove from frontend
    const updated = [...rooms];
    updated.splice(index, 1);
    setRooms(updated);
  };

  const reset = () => {
    setRooms([]);
    setLoadedRooms([]);
    localStorage.removeItem('homeRooms');
  };

  const saveRoom = async (roomIndex) => {
    try {
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
      
      if (!userEmail) {
        alert('Please log in to save room.');
        return;
      }

      const room = rooms[roomIndex];
      
      if (!room.name.trim()) {
        alert('Please enter a room name.');
        return;
      }

      if (!room.type) {
        alert('Please select a room type.');
        return;
      }

      const roomData = {
        roomName: room.name,
        roomType: room.type,
        homeowner: {
          email: userEmail
        }
      };

      const response = await fetch('https://homemanagement-backend.onrender.com/api/room-setup/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData)
      });
      
      console.log('data sent to backend:', roomData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save room');
      }

      // Mark room as saved
      const updated = [...rooms];
      updated[roomIndex].isSaved = true;
      updated[roomIndex].isNew = false;
      setRooms(updated);

      alert('Room saved successfully!');
    } catch (error) {
      console.error('Error saving room:', error);
      alert(`Failed to save room: ${error.message}`);
    }
  };

  const saveNewDevices = async (roomIndex) => {
    try {
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
      
      if (!userEmail) {
        alert('Please log in to save devices.');
        return;
      }

      const room = rooms[roomIndex];
      const newDevices = room.devices.filter(device => device.isNew);

      if (newDevices.length === 0) {
        alert('No new devices to save.');
        return;
      }

      // Validate devices
      const invalidDevices = newDevices.filter(device => 
        !device.name.trim() || !device.watts || !device.hours
      );

      if (invalidDevices.length > 0) {
        alert('Please complete all device information before saving.');
        return;
      }

      const deviceData = newDevices.map(device => ({
        deviceName: device.name,
        watts: parseFloat(device.watts),
        hoursPerDay: parseFloat(device.hours),
        quantity: parseInt(device.quantity) || 1,
        room: {
          roomName: room.name
        }
      }));

      const response = await fetch('https://homemanagement-backend.onrender.com/api/room-setup/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save devices');
      }

      // Mark devices as saved
      const updated = [...rooms];
      updated[roomIndex].devices.forEach(device => {
        if (device.isNew) {
          device.isNew = false;
          device.isSaved = true;
        }
      });
      setRooms(updated);

      alert('Devices saved successfully!');
    } catch (error) {
      console.error('Error saving devices:', error);
      alert(`Failed to save devices: ${error.message}`);
    }
  };

  const loadFromDatabase = async () => {
    try {
      setIsLoading(true);
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
      
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`https://homemanagement-backend.onrender.com/api/room-setup/setup/${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to load room setup');
      }

      const data = await response.json();
      
      if (!data.rooms || data.rooms.length === 0) {
        setIsLoading(false);
        return;
      }

      // Transform the data to match frontend structure
      const loadedRooms = data.rooms.map((roomData, index) => ({
        id: Date.now() + index,
        name: roomData.room.roomName,
        type: roomData.room.roomType || '',
        devices: roomData.devices.map((device, deviceIndex) => ({
          id: Date.now() + index * 1000 + deviceIndex,
          name: device.deviceName,
          watts: device.watts.toString(),
          hours: device.hoursPerDay.toString(),
          quantity: device.quantity,
          isNew: false,
          isSaved: true
        })),
        isNew: false,
        isSaved: true
      }));

      setRooms(loadedRooms);
      setLoadedRooms(loadedRooms);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading room setup:', error);
      setIsLoading(false);
    }
  };

  // Professional color scheme and styles
  const styles = {
    roomSetupPage: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      margin: 0,
      padding: 0,
      color: '#1e293b',
    },
    roomSetupHeader: {
      background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
      color: '#ffffff',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: '600',
      margin: 0,
      letterSpacing: '-0.025em',
    },
    subtitle: {
      fontSize: '1.125rem',
      margin: '0.5rem 0 0 0',
      opacity: 0.9,
      fontWeight: '400',
    },
    backBtn: {
      position: 'absolute',
      top: '2rem',
      left: '2rem',
      background: 'rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      fontSize: '0.9rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
    },
    setupContainer: {
      background: '#ffffff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    roomContainer: {
      marginBottom: '2rem',
      border: '1px solid #d1d5db',
      padding: '1.5rem',
      borderRadius: '12px',
      background: '#fafafa',
      transition: 'all 0.2s ease',
    },
    savedRoomContainer: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #0ea5e9',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    roomHeader: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr auto',
      alignItems: 'end',
      marginBottom: '1.5rem',
      gap: '1rem',
    },
    roomInputGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    roomHeaderLabel: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    roomHeaderInput: {
      fontSize: '1rem',
      fontWeight: '500',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '0.75rem',
      transition: 'all 0.2s ease',
      background: '#ffffff',
    },
    roomTypeSelect: {
      fontSize: '1rem',
      fontWeight: '500',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '0.75rem',
      transition: 'all 0.2s ease',
      background: '#ffffff',
      cursor: 'pointer',
    },
    disabledInput: {
      backgroundColor: '#f3f4f6',
      cursor: 'not-allowed',
      color: '#6b7280',
    },
    deviceSectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    savedDevicesContainer: {
      border: '1px solid #10b981',
      backgroundColor: '#f0fdf4',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1rem',
    },
    newDevicesContainer: {
      border: '1px solid #3b82f6',
      backgroundColor: '#eff6ff',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1rem',
    },
    deviceTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '1rem',
    },
    deviceTableHeader: {
      backgroundColor: '#f8fafc',
      borderBottom: '2px solid #e5e7eb',
    },
    deviceTableHeaderCell: {
      padding: '0.75rem',
      textAlign: 'left',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      border: '1px solid #e5e7eb',
    },
    deviceTableRow: {
      borderBottom: '1px solid #e5e7eb',
    },
    deviceTableCell: {
      padding: '0.75rem',
      border: '1px solid #e5e7eb',
    },
    deviceInput: {
      width: '100%',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      padding: '0.5rem',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      background: '#ffffff',
    },
    btn: {
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    },
    btnDanger: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
    },
    btnSuccess: {
      background: 'linear-gradient(135deg, #059669, #047857)',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
    },
    btnSmall: {
      fontSize: '0.75rem',
      padding: '0.5rem 1rem',
    },
    actions: {
      marginTop: '2rem',
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    actionBtn: {
      flex: 1,
      minWidth: '150px',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    },
    actionBtnDanger: {
      flex: 1,
      minWidth: '150px',
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
    },
    actionBtnSuccess: {
      flex: 1,
      minWidth: '150px',
      background: 'linear-gradient(135deg, #059669, #047857)',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
    },
    summaryContainer: {
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
      border: '1px solid #0ea5e9',
      borderRadius: '12px',
    },
    summaryTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
    },
    summaryStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
    },
    statItem: {
      textAlign: 'center',
      padding: '1rem',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e40af',
      margin: '0.5rem 0',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      fontWeight: '500',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      fontSize: '1rem',
      color: '#6b7280',
    },
  };

  const getTotalDevices = () => {
    return rooms.reduce((total, room) => total + room.devices.length, 0);
  };

  const getTotalPower = () => {
    return rooms.reduce((total, room) => {
      return total + room.devices.reduce((roomTotal, device) => {
        const watts = parseFloat(device.watts) || 0;
        const quantity = parseInt(device.quantity) || 1;
        return roomTotal + (watts * quantity);
      }, 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <div style={styles.roomSetupPage}>
        <header style={styles.roomSetupHeader}>
          <h1 style={styles.title}>Room & Device Setup</h1>
          <p style={styles.subtitle}>Loading your room configuration...</p>
        </header>
        <main style={styles.container}>
          <div style={styles.setupContainer}>
            <div style={styles.loadingContainer}>
              <div>Loading room setup from database...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.roomSetupPage}>
      <header style={styles.roomSetupHeader}>
        <h1 style={styles.title}>🏠 Room & Device Setup</h1>
        <p style={styles.subtitle}>Configure your rooms and electrical devices for accurate cost calculations</p>
        <button 
          onClick={() => navigate('/home')} 
          style={styles.backBtn}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.25)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
        >
          ← Back to Home
        </button>
      </header>

      <main style={styles.container}>
        <div style={styles.setupContainer}>
          <h2 style={styles.sectionTitle}>
            <span>📋</span> Room & Device Management
          </h2>

          {rooms.map((room, roomIndex) => (
            <div 
              style={{
                ...styles.roomContainer,
                ...(room.isSaved ? styles.savedRoomContainer : {})
              }} 
              key={room.id}
            >
              <div style={styles.roomHeader}>
                <div style={styles.roomInputGroup}>
                  <div style={styles.roomHeaderLabel}>Room Name</div>
                  <input
                    type="text"
                    placeholder="Enter room name (e.g., Master Bedroom)"
                    value={room.name}
                    onChange={(e) => updateRoom(roomIndex, 'name', e.target.value)}
                    style={{
                      ...styles.roomHeaderInput,
                      ...(room.isSaved ? styles.disabledInput : {})
                    }}
                    disabled={room.isSaved}
                  />
                </div>
                <div style={styles.roomInputGroup}>
                  <div style={styles.roomHeaderLabel}>Room Type</div>
                  <select
                    value={room.type}
                    onChange={(e) => updateRoom(roomIndex, 'type', e.target.value)}
                    style={{
                      ...styles.roomTypeSelect,
                      ...(room.isSaved ? styles.disabledInput : {})
                    }}
                    disabled={room.isSaved}
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {room.isNew && !room.isSaved && (
                    <button 
                      style={{...styles.btnSuccess, ...styles.btnSmall}} 
                      onClick={() => saveRoom(roomIndex)}
                      onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      💾 Save Room
                    </button>
                  )}
                  <button 
                    style={{...styles.btnDanger, ...styles.btnSmall}} 
                    onClick={() => removeRoom(roomIndex)}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>

              {/* Saved Devices Section */}
              {room.devices.filter(device => !device.isNew).length > 0 && (
                <div style={styles.savedDevicesContainer}>
                  <h4 style={styles.deviceSectionTitle}>
                    <span>✅</span> Saved Devices
                  </h4>
                  <table style={styles.deviceTable}>
                    <thead style={styles.deviceTableHeader}>
                      <tr>
                        <th style={styles.deviceTableHeaderCell}>Device Name</th>
                        <th style={styles.deviceTableHeaderCell}>Power (Watts)</th>
                        <th style={styles.deviceTableHeaderCell}>Usage (Hours/Day)</th>
                        <th style={styles.deviceTableHeaderCell}>Quantity</th>
                        <th style={styles.deviceTableHeaderCell}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.devices.filter(device => !device.isNew).map((device, deviceIndex) => (
                        <tr style={styles.deviceTableRow} key={device.id}>
                          <td style={styles.deviceTableCell}>
                            <strong>{device.name}</strong>
                          </td>
                          <td style={styles.deviceTableCell}>{device.watts}W</td>
                          <td style={styles.deviceTableCell}>{device.hours} hrs</td>
                          <td style={styles.deviceTableCell}>{device.quantity}</td>
                          <td style={styles.deviceTableCell}>
                            <span style={{ color: '#10b981', fontWeight: '500' }}>✓ Saved</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* New Devices Section */}
              {room.devices.filter(device => device.isNew).length > 0 && (
                <div style={styles.newDevicesContainer}>
                  <h4 style={styles.deviceSectionTitle}>
                    <span>➕</span> New Devices
                  </h4>
                  <table style={styles.deviceTable}>
                    <thead style={styles.deviceTableHeader}>
                      <tr>
                        <th style={styles.deviceTableHeaderCell}>Device Name</th>
                        <th style={styles.deviceTableHeaderCell}>Power (Watts)</th>
                        <th style={styles.deviceTableHeaderCell}>Usage (Hours/Day)</th>
                        <th style={styles.deviceTableHeaderCell}>Quantity</th>
                        <th style={styles.deviceTableHeaderCell}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.devices.filter(device => device.isNew).map((device, deviceIndex) => {
                        const actualIndex = room.devices.findIndex(d => d.id === device.id);
                        return (
                          <tr style={styles.deviceTableRow} key={device.id}>
                            <td style={styles.deviceTableCell}>
                              <input
                                type="text"
                                placeholder="e.g., LED Bulb, AC, Fan"
                                value={device.name}
                                onChange={(e) => updateDevice(roomIndex, actualIndex, 'name', e.target.value)}
                                style={styles.deviceInput}
                              />
                            </td>
                            <td style={styles.deviceTableCell}>
                              <input
                                type="number"
                                placeholder="60"
                                value={device.watts}
                                onChange={(e) => updateDevice(roomIndex, actualIndex, 'watts', e.target.value)}
                                style={styles.deviceInput}
                              />
                            </td>
                            <td style={styles.deviceTableCell}>
                              <input
                                type="number"
                                placeholder="8"
                                value={device.hours}
                                onChange={(e) => updateDevice(roomIndex, actualIndex, 'hours', e.target.value)}
                                style={styles.deviceInput}
                              />
                            </td>
                            <td style={styles.deviceTableCell}>
                              <input
                                type="number"
                                placeholder="1"
                                value={device.quantity}
                                onChange={(e) => updateDevice(roomIndex, actualIndex, 'quantity', e.target.value)}
                                style={styles.deviceInput}
                              />
                            </td>
                            <td style={styles.deviceTableCell}>
                              <button 
                                style={{...styles.btnDanger, ...styles.btnSmall}} 
                                onClick={() => removeDevice(roomIndex, actualIndex)}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {room.isSaved && (
                    <button 
                      style={{...styles.btnSuccess, ...styles.btnSmall}} 
                      onClick={() => saveNewDevices(roomIndex)}
                      onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      💾 Save These Devices
                    </button>
                  )}
                </div>
              )}

              {room.isSaved && (
                <button 
                  style={{...styles.btn, ...styles.btnSmall}} 
                  onClick={() => addDevice(roomIndex)}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ➕ Add Device
                </button>
              )}
            </div>
          ))}

          <button 
            style={styles.btn} 
            onClick={addRoom}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🏠 Add New Room
          </button>

          <div style={styles.actions}>
            <button 
              style={styles.actionBtnSuccess} 
              onClick={loadFromDatabase}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🔄 Refresh from Database
            </button>
            <button 
              style={styles.actionBtnDanger} 
              onClick={reset}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🗑️ Reset All
            </button>
          </div>

          {rooms.length > 0 && (
            <div style={styles.summaryContainer}>
              <h3 style={styles.summaryTitle}>📊 Setup Summary</h3>
              <div style={styles.summaryStats}>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{rooms.length}</div>
                  <div style={styles.statLabel}>Total Rooms</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{getTotalDevices()}</div>
                  <div style={styles.statLabel}>Total Devices</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{getTotalPower().toFixed(0)}W</div>
                  <div style={styles.statLabel}>Total Power Usage</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

RoomSetup.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
};

export default RoomSetup;