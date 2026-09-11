import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

/*
BACKEND API ENDPOINTS NEEDED:

1. Bill Reminders:
   POST /api/bill-reminders - Save bill reminder
   GET /api/bill-reminders/:userEmail - Get user's bill reminders
   DELETE /api/bill-reminders/:userEmail/:id - Delete bill reminder

2. Maintenance Reminders:
   POST /api/maintenance-reminders - Save maintenance reminder
   GET /api/maintenance-reminders/:userEmail - Get user's maintenance reminders
   DELETE /api/maintenance-reminders/:userEmail/:id - Delete maintenance reminder

3. Budget Alerts:
   POST /api/budget-alerts - Save budget data
   GET /api/budget-alerts/:userEmail - Get user's budget data

4. Email Notifications:
   POST /api/check-due-reminders - Check for due reminders and send emails
   POST /api/test-email - Test email configuration

Expected Data Structures:
- Bill Reminder: { id, type, title, dueDate, amount, frequency, description, userEmail, created }
- Maintenance Reminder: { id, device, task, frequency, lastDone, nextDue, userEmail }
- Budget Alerts: { groceryBudget, grocerySpent, electricityBudget, electricityEstimate }

Email notifications should be sent when:
- Bill due date is today
- Maintenance due date is today
- Budget spending exceeds 90% of budget
*/

const BillReminders = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    type: 'electricity',
    title: '',
    dueDate: '',
    amount: '',
    frequency: 'monthly',
    description: ''
  });
  const [budgetAlerts, setBudgetAlerts] = useState({
    groceryBudget: 0,
    grocerySpent: 0,
    electricityBudget: 0,
    electricityEstimate: 0
  });
  const [maintenanceReminders, setMaintenanceReminders] = useState([]);
  const [newMaintenance, setNewMaintenance] = useState({
    device: '',
    task: '',
    frequency: 'monthly',
    lastDone: '',
    nextDue: ''
  });

  // EmailJS Configuration - Replace with your actual EmailJS credentials
  const EMAILJS_CONFIG = {
    serviceId: 'service_hh38j1p',      // Replace with your EmailJS service ID
    templateId: 'template_5dt2f2i',    // Replace with your EmailJS template ID
    publicKey: '9Lx9DPsjBwlMuDvAB'       // Replace with your EmailJS public key
  };

  // API base URL
  const API_BASE_URL = 'https://homemanagement-backend.onrender.com/api';

  // API functions for bill reminders
  const saveBillReminder = async (reminder) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bill-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminder),
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to save bill reminder');
      }
    } catch (error) {
      console.error('Error saving bill reminder:', error);
      throw error;
    }
  };

  const getBillReminders = async (userEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bill-reminders/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
      } else {
        throw new Error('Failed to fetch bill reminders');
      }
    } catch (error) {
      console.error('Error fetching bill reminders:', error);
      return [];
    }
  };

  const deleteBillReminder = async (userEmail, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bill-reminders/${userEmail}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete bill reminder');
      }
    } catch (error) {
      console.error('Error deleting bill reminder:', error);
      throw error;
    }
  };

  // API functions for maintenance reminders
  const saveMaintenanceReminder = async (maintenance) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenance),
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to save maintenance reminder');
      }
    } catch (error) {
      console.error('Error saving maintenance reminder:', error);
      throw error;
    }
  };

  const getMaintenanceReminders = async (userEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance-reminders/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
      } else {
        throw new Error('Failed to fetch maintenance reminders');
      }
    } catch (error) {
      console.error('Error fetching maintenance reminders:', error);
      return [];
    }
  };

  const deleteMaintenanceReminder = async (userEmail, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance-reminders/${userEmail}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete maintenance reminder');
      }
    } catch (error) {
      console.error('Error deleting maintenance reminder:', error);
      throw error;
    }
  };

  // API functions for budget alerts
  const saveBudgetAlerts = async (userEmail, budgetData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/budget-alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail, ...budgetData }),
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to save budget alerts');
      }
    } catch (error) {
      console.error('Error saving budget alerts:', error);
      throw error;
    }
  };

  const getBudgetAlerts = async (userEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/budget-alerts/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure we return a proper object
        return data && typeof data === 'object' ? data : {
          groceryBudget: 0,
          grocerySpent: 0,
          electricityBudget: 0,
          electricityEstimate: 0
        };
      } else {
        throw new Error('Failed to fetch budget alerts');
      }
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
      return {
        groceryBudget: 0,
        grocerySpent: 0,
        electricityBudget: 0,
        electricityEstimate: 0
      };
    }
  };

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }, []);

  // Load data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
      
      if (userEmail) {
        try {
          // Load from database
          const [billRemindersData, maintenanceData, budgetData] = await Promise.all([
            getBillReminders(userEmail),
            getMaintenanceReminders(userEmail),
            getBudgetAlerts(userEmail)
          ]);
          
          // Ensure data is in correct format before setting state
          setReminders(Array.isArray(billRemindersData) ? billRemindersData : []);
          setMaintenanceReminders(Array.isArray(maintenanceData) ? maintenanceData : []);
          setBudgetAlerts(budgetData && typeof budgetData === 'object' ? budgetData : {
            groceryBudget: 0,
            grocerySpent: 0,
            electricityBudget: 0,
            electricityEstimate: 0
          });
        } catch (error) {
          console.error('Error loading data from database:', error);
          // Fallback to localStorage
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage if not logged in
        loadFromLocalStorage();
      }
      
      calculateElectricityEstimate();
    };

    const loadFromLocalStorage = () => {
      const savedReminders = localStorage.getItem('billReminders');
      const savedBudgets = localStorage.getItem('budgetAlerts');
      const savedMaintenance = localStorage.getItem('maintenanceReminders');
      
      // Ensure parsed data is arrays/objects before setting state
      if (savedReminders) {
        try {
          const parsed = JSON.parse(savedReminders);
          setReminders(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setReminders([]);
        }
      }
      
      if (savedBudgets) {
        try {
          const parsed = JSON.parse(savedBudgets);
          setBudgetAlerts(parsed && typeof parsed === 'object' ? parsed : {
            groceryBudget: 0,
            grocerySpent: 0,
            electricityBudget: 0,
            electricityEstimate: 0
          });
        } catch (e) {
          setBudgetAlerts({
            groceryBudget: 0,
            grocerySpent: 0,
            electricityBudget: 0,
            electricityEstimate: 0
          });
        }
      }
      
      if (savedMaintenance) {
        try {
          const parsed = JSON.parse(savedMaintenance);
          setMaintenanceReminders(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setMaintenanceReminders([]);
        }
      }
    };

    loadData();
  }, []);

  // Save data to database and localStorage whenever state changes
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    
    if (userEmail && reminders.length > 0) {
      // Save to localStorage as backup
      localStorage.setItem('billReminders', JSON.stringify(reminders));
    }
  }, [reminders]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    
    if (userEmail && Object.keys(budgetAlerts).length > 0) {
      // Save budget to database
      saveBudgetAlerts(userEmail, budgetAlerts).catch(console.error);
      // Save to localStorage as backup
      localStorage.setItem('budgetAlerts', JSON.stringify(budgetAlerts));
    }
  }, [budgetAlerts]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    
    if (userEmail && maintenanceReminders.length > 0) {
      // Save to localStorage as backup
      localStorage.setItem('maintenanceReminders', JSON.stringify(maintenanceReminders));
    }
  }, [maintenanceReminders]);

  const calculateElectricityEstimate = () => {
    const savedRooms = localStorage.getItem('homeRooms');
    const unitCost = parseFloat(localStorage.getItem('electricityUnitCost')) || 5.0;
    
    if (savedRooms) {
      const rooms = JSON.parse(savedRooms);
      let totalKWh = 0;
      
      rooms.forEach(room => {
        room.devices.forEach(device => {
          const watts = parseFloat(device.watts) || 0;
          const hours = parseFloat(device.hours) || 0;
          const quantity = parseInt(device.quantity) || 1;
          totalKWh += (watts * hours * quantity) / 1000;
        });
      });
      
      const monthlyEstimate = totalKWh * unitCost * 30;
      setBudgetAlerts(prev => ({ ...prev, electricityEstimate: monthlyEstimate }));
    }
  };

  // Fixed Email sending function with correct parameter names
  const sendEmail = async (templateParams) => {
    try {
      console.log('Sending email with params:', templateParams);
      
      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );
      
      console.log('Email sent successfully:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Fixed Test email configuration
  const testEmailConfiguration = async () => {
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (!userEmail) {
      alert('Please log in first to test email notifications');
      return;
    }

    // Check if EmailJS is configured
    if (EMAILJS_CONFIG.serviceId === 'your_service_id' || 
        EMAILJS_CONFIG.templateId === 'your_template_id' || 
        EMAILJS_CONFIG.publicKey === 'your_public_key') {
      alert('⚠️ EmailJS not configured yet!\n\nPlease:\n1. Sign up at emailjs.com\n2. Set up a service\n3. Create an email template\n4. Update the EMAILJS_CONFIG in the code');
      return;
    }

    try {
      // Fixed parameter names to match your EmailJS template
      const templateParams = {
        to_mail: userEmail,        // Changed from to_email to to_mail
        to_name: 'User',           // This matches {{to_name}}
        user_name: 'User',         // Added for {{user_name}} if needed
        message: `
Hello!

This is a test email from your Home Management System to confirm that email notifications are working correctly.

✅ What this means:
• Email configuration is working properly
• You'll receive notifications for due bills
• You'll get maintenance reminders
• Budget alerts will be sent when needed

Sent at: ${new Date().toLocaleString()}
From: Home Management System
To: ${userEmail}

Best regards,
Home Management Team
        `
      };

      const result = await sendEmail(templateParams);
      
      if (result.success) {
        alert('✅ Test email sent successfully! Check your inbox to verify email notifications are working.');
      } else {
        alert(`❌ Failed to send test email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('❌ Failed to send test email. Please check your EmailJS configuration.');
    }
  };

  // Fixed Check for due reminders and send notifications
  const checkAndSendNotifications = async () => {
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (!userEmail) return;

    // Check if EmailJS is configured
    if (EMAILJS_CONFIG.serviceId === 'your_service_id') {
      console.log('EmailJS not configured, skipping email notifications');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    let notifications = [];

    // Check bill reminders - ensure reminders is an array
    if (Array.isArray(reminders)) {
      const dueBills = reminders.filter(bill => bill.dueDate === today);
      if (dueBills.length > 0) {
        notifications.push({
          type: 'bills',
          items: dueBills,
          message: `📋 Bills Due Today:\n${dueBills.map(bill => `• ${bill.title} - ৳${bill.amount} (${bill.type})`).join('\n')}`
        });
      }
    }

    // Check maintenance reminders - ensure maintenanceReminders is an array
    if (Array.isArray(maintenanceReminders)) {
      const dueMaintenance = maintenanceReminders.filter(maintenance => maintenance.nextDue === today);
      if (dueMaintenance.length > 0) {
        notifications.push({
          type: 'maintenance',
          items: dueMaintenance,
          message: `🔧 Maintenance Due Today:\n${dueMaintenance.map(maintenance => `• ${maintenance.device} - ${maintenance.task}`).join('\n')}`
        });
      }
    }

    // Check budget alerts - ensure budgetAlerts is an object
    let budgetAlertMessages = [];
    if (budgetAlerts && typeof budgetAlerts === 'object') {
      if (budgetAlerts.groceryBudget && budgetAlerts.grocerySpent) {
        const groceryPercentage = (budgetAlerts.grocerySpent / budgetAlerts.groceryBudget) * 100;
        if (groceryPercentage >= 90) {
          budgetAlertMessages.push(`💰 Grocery Budget Alert: ${groceryPercentage.toFixed(1)}% used (৳${budgetAlerts.grocerySpent}/৳${budgetAlerts.groceryBudget})`);
        }
      }

      if (budgetAlerts.electricityBudget && budgetAlerts.electricityEstimate) {
        const electricityPercentage = (budgetAlerts.electricityEstimate / budgetAlerts.electricityBudget) * 100;
        if (electricityPercentage >= 90) {
          budgetAlertMessages.push(`⚡ Electricity Budget Alert: ${electricityPercentage.toFixed(1)}% used (৳${budgetAlerts.electricityEstimate.toFixed(0)}/৳${budgetAlerts.electricityBudget})`);
        }
      }
    }

    if (budgetAlertMessages.length > 0) {
      notifications.push({
        type: 'budget',
        items: budgetAlertMessages,
        message: budgetAlertMessages.join('\n')
      });
    }

    // Send email if there are notifications
    if (notifications.length > 0) {
      try {
        const allMessages = notifications.map(n => n.message).join('\n\n');
        
        // Fixed parameter names to match your EmailJS template
        const templateParams = {
          to_mail: userEmail,        // Changed from to_email to to_mail
          to_name: 'User',           // This matches {{to_name}}
          user_name: 'User',         // Added for {{user_name}} if needed
          message: `
Hello!

Here are your reminders and alerts for today:

${allMessages}

Sent automatically by your Home Management System
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Best regards,
Home Management Team
          `
        };

        const result = await sendEmail(templateParams);
        if (result.success) {
          console.log('Daily notification email sent successfully');
          return notifications.length;
        }
      } catch (error) {
        console.error('Error sending notification email:', error);
      }
    }

    return 0;
  };

  // Manual notification check
  const manualNotificationCheck = async () => {
    const notificationsSent = await checkAndSendNotifications();
    if (notificationsSent > 0) {
      alert(`✅ ${notificationsSent} notification email(s) sent successfully!`);
    } else {
      alert('ℹ️ No reminders due today. All good!');
    }
  };

  // Auto-check for notifications on component mount and periodically
  useEffect(() => {
    checkAndSendNotifications();
    
    // Check every hour for due reminders
    const interval = setInterval(checkAndSendNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [reminders, maintenanceReminders, budgetAlerts]);

  const addReminder = async () => {
    if (!newReminder.title || !newReminder.dueDate) {
      alert('Please fill in title and due date');
      return;
    }

    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (!userEmail) {
      alert('Please log in to save reminders');
      return;
    }

    const reminder = {
      id: Date.now(),
      ...newReminder,
      userEmail,
      created: new Date().toISOString()
    };

    try {
      await saveBillReminder(reminder);
      setReminders([...reminders, reminder]);
      setNewReminder({
        type: 'electricity',
        title: '',
        dueDate: '',
        amount: '',
        frequency: 'monthly',
        description: ''
      });
      alert('Bill reminder added successfully!');
    } catch (error) {
      alert('Failed to save bill reminder. Please try again.');
    }
  };

  const addMaintenanceReminder = async () => {
    if (!newMaintenance.device || !newMaintenance.task) {
      alert('Please fill in device and task');
      return;
    }

    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (!userEmail) {
      alert('Please log in to save reminders');
      return;
    }

    // Calculate next due date based on frequency
    const lastDone = new Date(newMaintenance.lastDone || Date.now());
    const nextDue = new Date(lastDone);
    
    switch (newMaintenance.frequency) {
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'yearly':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      default:
        nextDue.setMonth(nextDue.getMonth() + 1);
    }

    const maintenance = {
      id: Date.now(),
      ...newMaintenance,
      userEmail,
      nextDue: nextDue.toISOString().split('T')[0]
    };

    try {
      await saveMaintenanceReminder(maintenance);
      setMaintenanceReminders([...maintenanceReminders, maintenance]);
      setNewMaintenance({
        device: '',
        task: '',
        frequency: 'monthly',
        lastDone: '',
        nextDue: ''
      });
      alert('Maintenance reminder added successfully!');
    } catch (error) {
      alert('Failed to save maintenance reminder. Please try again.');
    }
  };

  const removeReminder = async (id) => {
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    
    try {
      if (userEmail) {
        await deleteBillReminder(userEmail, id);
      }
      setReminders(reminders.filter(r => r.id !== id));
    } catch (error) {
      alert('Failed to delete reminder. Please try again.');
    }
  };

  const removeMaintenance = async (id) => {
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    
    try {
      if (userEmail) {
        await deleteMaintenanceReminder(userEmail, id);
      }
      setMaintenanceReminders(maintenanceReminders.filter(m => m.id !== id));
    } catch (error) {
      alert('Failed to delete maintenance reminder. Please try again.');
    }
  };

  const updateBudget = (field, value) => {
    setBudgetAlerts(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAlertColor = (daysUntil) => {
    if (daysUntil < 0) return '#ef4444'; // Overdue - red
    if (daysUntil <= 3) return '#f59e0b'; // Due soon - orange
    if (daysUntil <= 7) return '#eab308'; // Due this week - yellow
    return '#22c55e'; // Good - green
  };

  const getBudgetAlertColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return '#ef4444'; // Over budget - red
    if (percentage >= 80) return '#f59e0b'; // Near budget - orange
    if (percentage >= 60) return '#eab308'; // Approaching - yellow
    return '#22c55e'; // Good - green
  };

  // Inline styles
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      margin: 0,
      padding: 0,
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      color: '#ffffff',
      padding: '3rem 2rem',
      textAlign: 'center',
      position: 'relative',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      margin: 0,
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    subtitle: {
      fontSize: '1.2rem',
      margin: '0.5rem 0 0 0',
      opacity: 0.9,
      fontWeight: '400',
    },
    backBtn: {
      position: 'absolute',
      top: '2rem',
      left: '2rem',
      background: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
    },
    section: {
      background: '#ffffff',
      borderRadius: '20px',
      padding: '2.5rem',
      marginBottom: '2rem',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      color: '#1e293b',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
    },
    select: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: '#ffffff',
    },
    textarea: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      minHeight: '80px',
      resize: 'vertical',
    },
    btn: {
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
    },
    btnDanger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.8rem',
      transition: 'all 0.3s ease',
    },
    reminderCard: {
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      marginBottom: '1rem',
      background: '#f8fafc',
      position: 'relative',
    },
    alertBadge: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#ffffff',
    },
    budgetGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
    },
    budgetCard: {
      padding: '1.5rem',
      border: '2px solid',
      borderRadius: '12px',
      textAlign: 'center',
      background: '#ffffff',
    },
    budgetValue: {
      fontSize: '2rem',
      fontWeight: '700',
      margin: '0.5rem 0',
    },
    budgetLabel: {
      fontSize: '0.9rem',
      color: '#64748b',
      fontWeight: '500',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '1rem',
    },
    progressFill: {
      height: '100%',
      transition: 'width 0.3s ease',
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Smart Bill Reminders</h1>
        <p style={styles.subtitle}>Stay on top of your bills, budgets, and maintenance schedules</p>
        <button 
          onClick={() => navigate('/home')} 
          style={styles.backBtn}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          ← Back to Home
        </button>
        <button 
          onClick={manualNotificationCheck}
          style={{
            ...styles.backBtn,
            right: '14rem',
            left: 'auto',
            background: 'rgba(34, 197, 94, 0.8)'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(34, 197, 94, 1)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(34, 197, 94, 0.8)'}
        >
          📧 Check & Send Notifications
        </button>
        <button 
          onClick={testEmailConfiguration}
          style={{
            ...styles.backBtn,
            right: '2rem',
            left: 'auto',
            background: 'rgba(59, 130, 246, 0.8)'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(59, 130, 246, 1)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.8)'}
        >
          🧪 Test Email
        </button>
      </header>

      <main style={styles.container}>
        {/* Email Configuration Status */}
        <div style={{
          ...styles.section,
          padding: '1rem 2rem',
          marginBottom: '1rem',
          background: EMAILJS_CONFIG.serviceId !== 'your_service_id' 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
          border: `2px solid ${EMAILJS_CONFIG.serviceId !== 'your_service_id' ? '#22c55e' : '#ef4444'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>
              {EMAILJS_CONFIG.serviceId !== 'your_service_id' ? '📧' : '⚠️'}
            </span>
            <div>
              <h3 style={{ margin: 0, color: '#1e293b' }}>
                {EMAILJS_CONFIG.serviceId !== 'your_service_id' 
                  ? 'Email Notifications: Enabled' 
                  : 'Email Notifications: Not Configured'}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                {EMAILJS_CONFIG.serviceId !== 'your_service_id'
                  ? 'Email notifications are working and will be sent for due reminders'
                  : 'Please configure EmailJS to enable email notifications (visit emailjs.com)'}
              </p>
            </div>
          </div>
        </div>

        {/* User Status Indicator */}
        <div style={{
          ...styles.section,
          padding: '1rem 2rem',
          marginBottom: '1rem',
          background: localStorage.getItem('userEmail') || localStorage.getItem('email') 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
          border: `2px solid ${localStorage.getItem('userEmail') || localStorage.getItem('email') ? '#22c55e' : '#ef4444'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>
              {localStorage.getItem('userEmail') || localStorage.getItem('email') ? '✅' : '❌'}
            </span>
            <div>
              <h3 style={{ margin: 0, color: '#1e293b' }}>
                {localStorage.getItem('userEmail') || localStorage.getItem('email') 
                  ? `Logged in as: ${localStorage.getItem('userEmail') || localStorage.getItem('email')}` 
                  : 'Not logged in'}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                {localStorage.getItem('userEmail') || localStorage.getItem('email')
                  ? 'Data is being saved locally and email notifications will be sent to this address'
                  : 'Please log in to enable email notifications'}
              </p>
            </div>
          </div>
        </div>

        {/* Budget Alerts Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Budget Overview & Alerts</h2>
          <div style={styles.budgetGrid}>
            <div style={{
              ...styles.budgetCard,
              borderColor: getBudgetAlertColor(budgetAlerts.grocerySpent, budgetAlerts.groceryBudget)
            }}>
              <div style={styles.budgetLabel}>Grocery Budget</div>
              <div style={{
                ...styles.budgetValue,
                color: getBudgetAlertColor(budgetAlerts.grocerySpent, budgetAlerts.groceryBudget)
              }}>
                ৳{budgetAlerts.grocerySpent} / ৳{budgetAlerts.groceryBudget}
              </div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${Math.min((budgetAlerts.grocerySpent / budgetAlerts.groceryBudget) * 100, 100)}%`,
                  backgroundColor: getBudgetAlertColor(budgetAlerts.grocerySpent, budgetAlerts.groceryBudget)
                }}></div>
              </div>
            </div>
            
            <div style={{
              ...styles.budgetCard,
              borderColor: getBudgetAlertColor(budgetAlerts.electricityEstimate, budgetAlerts.electricityBudget)
            }}>
              <div style={styles.budgetLabel}>Electricity Budget</div>
              <div style={{
                ...styles.budgetValue,
                color: getBudgetAlertColor(budgetAlerts.electricityEstimate, budgetAlerts.electricityBudget)
              }}>
                ৳{budgetAlerts.electricityEstimate.toFixed(0)} / ৳{budgetAlerts.electricityBudget}
              </div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${Math.min((budgetAlerts.electricityEstimate / budgetAlerts.electricityBudget) * 100, 100)}%`,
                  backgroundColor: getBudgetAlertColor(budgetAlerts.electricityEstimate, budgetAlerts.electricityBudget)
                }}></div>
              </div>
            </div>
          </div>
          
          <div style={styles.formGrid}>
            <input
              type="number"
              placeholder="Grocery Budget (৳)"
              value={budgetAlerts.groceryBudget || ''}
              onChange={(e) => updateBudget('groceryBudget', e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Grocery Spent (৳)"
              value={budgetAlerts.grocerySpent || ''}
              onChange={(e) => updateBudget('grocerySpent', e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Electricity Budget (৳)"
              value={budgetAlerts.electricityBudget || ''}
              onChange={(e) => updateBudget('electricityBudget', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        {/* Bill Reminders Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Bill Reminders</h2>
          
          <div style={styles.formGrid}>
            <select
              value={newReminder.type}
              onChange={(e) => setNewReminder({...newReminder, type: e.target.value})}
              style={styles.select}
            >
              <option value="electricity">Electricity Bill</option>
              <option value="gas">Gas Bill</option>
              <option value="water">Water Bill</option>
              <option value="internet">Internet Bill</option>
              <option value="other">Other</option>
            </select>
            
            <input
              type="text"
              placeholder="Bill Title"
              value={newReminder.title}
              onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
              style={styles.input}
            />
            
            <input
              type="date"
              value={newReminder.dueDate}
              onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
              style={styles.input}
            />
            
            <input
              type="number"
              placeholder="Amount (৳)"
              value={newReminder.amount}
              onChange={(e) => setNewReminder({...newReminder, amount: e.target.value})}
              style={styles.input}
            />
            
            <select
              value={newReminder.frequency}
              onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
              style={styles.select}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="one-time">One Time</option>
            </select>
          </div>
          
          <textarea
            placeholder="Description (optional)"
            value={newReminder.description}
            onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
            style={{...styles.textarea, gridColumn: '1 / -1'}}
          />
          
          <button 
            onClick={addReminder}
            style={styles.btn}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Add Bill Reminder
          </button>

          {/* Display Reminders */}
          {Array.isArray(reminders) && reminders.map(reminder => {
            const daysUntil = getDaysUntilDue(reminder.dueDate);
            return (
              <div key={reminder.id} style={styles.reminderCard}>
                <div style={{
                  ...styles.alertBadge,
                  backgroundColor: getAlertColor(daysUntil)
                }}>
                  {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : 
                   daysUntil === 0 ? 'Due today' : 
                   `${daysUntil} days left`}
                </div>
                
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{reminder.title}</h3>
                <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>
                  Type: {reminder.type} | Due: {reminder.dueDate} | Amount: ৳{reminder.amount}
                </p>
                {reminder.description && (
                  <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontStyle: 'italic' }}>
                    {reminder.description}
                  </p>
                )}
                
                <button
                  onClick={() => removeReminder(reminder.id)}
                  style={styles.btnDanger}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Maintenance Reminders Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Device Maintenance Reminders</h2>
          
          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Device Name (e.g., AC, Refrigerator)"
              value={newMaintenance.device}
              onChange={(e) => setNewMaintenance({...newMaintenance, device: e.target.value})}
              style={styles.input}
            />
            
            <input
              type="text"
              placeholder="Maintenance Task (e.g., Filter Cleaning)"
              value={newMaintenance.task}
              onChange={(e) => setNewMaintenance({...newMaintenance, task: e.target.value})}
              style={styles.input}
            />
            
            <select
              value={newMaintenance.frequency}
              onChange={(e) => setNewMaintenance({...newMaintenance, frequency: e.target.value})}
              style={styles.select}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            
            <input
              type="date"
              placeholder="Last Done"
              value={newMaintenance.lastDone}
              onChange={(e) => setNewMaintenance({...newMaintenance, lastDone: e.target.value})}
              style={styles.input}
            />
          </div>
          
          <button 
            onClick={addMaintenanceReminder}
            style={styles.btn}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Add Maintenance Reminder
          </button>

          {/* Display Maintenance Reminders */}
          {Array.isArray(maintenanceReminders) && maintenanceReminders.map(maintenance => {
            const daysUntil = getDaysUntilDue(maintenance.nextDue);
            return (
              <div key={maintenance.id} style={styles.reminderCard}>
                <div style={{
                  ...styles.alertBadge,
                  backgroundColor: getAlertColor(daysUntil)
                }}>
                  {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : 
                   daysUntil === 0 ? 'Due today' : 
                   `${daysUntil} days left`}
                </div>
                
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
                  {maintenance.device} - {maintenance.task}
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: '#64748b' }}>
                  Frequency: {maintenance.frequency} | Next Due: {maintenance.nextDue}
                </p>
                
                <button
                  onClick={() => removeMaintenance(maintenance.id)}
                  style={styles.btnDanger}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default BillReminders;
