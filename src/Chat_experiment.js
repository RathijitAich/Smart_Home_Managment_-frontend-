import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ChatExperiment = ({ email, worker_email }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationEmail, setNewConversationEmail] = useState('');
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const [newConversationReceiverType, setNewConversationReceiverType] = useState('');
  const [startingConversation, setStartingConversation] = useState(false);
  const messagesEndRef = useRef(null);
  
  const user_email = email || worker_email;
  const user_type = email ? 'homeowner' : 'worker';
  const [stompClient, setStompClient] = useState(null);

  // WebSocket connection
  useEffect(() => {
    const socket = new SockJS('https://homemanagement-backend.onrender.com/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        setStompClient(client);
        client.subscribe('/topic/messages', (msg) => {
          const received = JSON.parse(msg.body);
          console.log('Received message via WebSocket:', received);
          
          // Add to messages if it's for current conversation
          if (selectedConversation) {
            const activeEmail = selectedConversation.participant.email;
            // Use case-insensitive comparison
            if (
              (received.senderEmail.toLowerCase() === user_email.toLowerCase() && 
               received.receiverEmail.toLowerCase() === activeEmail.toLowerCase()) ||
              (received.senderEmail.toLowerCase() === activeEmail.toLowerCase() && 
               received.receiverEmail.toLowerCase() === user_email.toLowerCase())
            ) {
              setMessages((prev) => {
                // Check if message already exists to avoid duplicates
                const exists = prev.some(msg => 
                  msg.id === received.id || 
                  (msg.messageContent === received.messageContent && 
                   msg.senderEmail.toLowerCase() === received.senderEmail.toLowerCase() &&
                   msg.sentAt === received.sentAt)
                );
                if (!exists) {
                  return [...prev, received];
                }
                return prev;
              });
            }
          }

          // Update conversations list
          fetchConversations();
        });
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      }
    });

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [selectedConversation, user_email]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch all messages and group by conversations
  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Get all messages for the current user
      const response = await axios.get(`https://homemanagement-backend.onrender.com/api/messages/user/${user_email}`);
      const allMessages = response.data;
      
      console.log('All messages:', allMessages);
      console.log("Type of data received:", typeof allMessages, "Length:", allMessages.length);
      console.log("Current user email:", user_email);

      // Check if we have valid messages
      if (!Array.isArray(allMessages) || allMessages.length === 0) {
        console.log('No messages found');
        setConversations([]);
        return;
      }

      // Group messages by conversation partner
      const conversationMap = new Map();
      
      // Normalize current user email to lowercase for comparison
      const normalizedUserEmail = user_email.toLowerCase();
      
      allMessages.forEach(message => {
        // Normalize message emails to lowercase for comparison
        const normalizedSender = message.senderEmail.toLowerCase();
        const normalizedReceiver = message.receiverEmail.toLowerCase();
        
        console.log('Processing message:', {
          content: message.messageContent,
          sender: normalizedSender,
          receiver: normalizedReceiver,
          currentUser: normalizedUserEmail
        });

        // Determine the conversation partner (the other person)
        let partnerEmail = null;
        
        if (normalizedSender === normalizedUserEmail && normalizedReceiver !== normalizedUserEmail) {
          // User sent this message to someone else
          partnerEmail = message.receiverEmail; // Use original case for display
        } else if (normalizedReceiver === normalizedUserEmail && normalizedSender !== normalizedUserEmail) {
          // Someone else sent this message to user
          partnerEmail = message.senderEmail; // Use original case for display
        } else {
          // Skip messages where user talks to themselves or invalid combinations
          console.log('Skipping message - self conversation or invalid:', {
            sender: normalizedSender,
            receiver: normalizedReceiver,
            user: normalizedUserEmail
          });
          return;
        }
        
        // Additional validation - make sure partnerEmail is valid
        if (!partnerEmail || partnerEmail.toLowerCase() === normalizedUserEmail) {
          console.log('Skipping message - invalid partner email:', partnerEmail);
          return;
        }
        
        console.log('Valid conversation partner found:', partnerEmail);
        
        // Use normalized email as key but store original for display
        const partnerKey = partnerEmail.toLowerCase();
        
        if (!conversationMap.has(partnerKey)) {
          conversationMap.set(partnerKey, {
            participant: {
              email: partnerEmail, // Keep original case for display
              name: partnerEmail.split('@')[0], // Extract name from email
              avatar: partnerEmail.charAt(0).toUpperCase(),
              profession: 'User',
              status: 'online'
            },
            messages: [],
            lastMessage: '',
            lastMessageTime: '',
            id: partnerKey // Use normalized email as ID
          });
        }
        
        conversationMap.get(partnerKey).messages.push(message);
      });

      console.log('Conversation map after processing:', conversationMap);

      // Convert map to array and sort by latest message
      const conversationList = Array.from(conversationMap.values()).map(conv => {
        const sortedMessages = conv.messages.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
        const lastMsg = sortedMessages[0];
        
        return {
          ...conv,
          lastMessage: lastMsg ? lastMsg.messageContent : 'No messages',
          lastMessageTime: lastMsg ? formatRelativeTime(lastMsg.sentAt) : '',
          messageCount: conv.messages.length
        };
      }).sort((a, b) => {
        const aTime = a.messages[0] ? new Date(a.messages[0].sentAt) : new Date(0);
        const bTime = b.messages[0] ? new Date(b.messages[0].sentAt) : new Date(0);
        return bTime - aTime;
      });

      console.log('Final processed conversations:', conversationList);
      setConversations(conversationList);
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user_email) {
      fetchConversations();
    }
  }, [user_email]);

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  // Enhanced send message function
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) {
      console.log('Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasConversation: !!selectedConversation,
        isSending: sendingMessage,
        hasStompClient: !!stompClient
      });
      return;
    }

    setSendingMessage(true);

    try {
      const messageToSend = {
        messageContent: newMessage.trim(),
        senderEmail: user_email,
        receiverEmail: selectedConversation.participant.email
      };

      console.log('Sending message:', messageToSend);

      // Method 1: Try WebSocket first
      if (stompClient && stompClient.connected) {
        console.log('Sending via WebSocket...');
        stompClient.publish({
          destination: '/app/sendMessage',
          body: JSON.stringify(messageToSend)
        });
        
        // Clear input immediately for better UX
        setNewMessage('');
        
      } else {
        // Method 2: Fallback to HTTP API
        console.log('WebSocket not available, sending via HTTP...');
        const response = await axios.post('https://homemanagement-backend.onrender.com/api/sendMessage', messageToSend);
        console.log('Message sent via HTTP:', response.data);
        
        // Add the returned message to state
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        
        // Refresh conversations to update last message
        fetchConversations();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // UPDATED: Start new conversation function with backend validation
  const handleStartConversation = async () => {
    if (!newConversationEmail.trim() || !newConversationMessage.trim() || !newConversationReceiverType || startingConversation) {
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newConversationEmail.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if trying to message themselves
    if (newConversationEmail.trim().toLowerCase() === user_email.toLowerCase()) {
      alert('You cannot send a message to yourself');
      return;
    }

    setStartingConversation(true);

    try {
      // Use the new StartConversation endpoint
      const conversationData = {
        senderEmail: user_email,
        receiverEmail: newConversationEmail.trim(),
        receiverType: newConversationReceiverType,
        messageContent: newConversationMessage.trim()
      };

      console.log('Starting new conversation with validation:', conversationData);

      // Call the StartConversation endpoint
      const response = await axios.post('https://homemanagement-backend.onrender.com/api/StartConversation', conversationData);
      console.log('Conversation started successfully:', response.data);

      // Clear form and close modal
      setNewConversationEmail('');
      setNewConversationMessage('');
      setNewConversationReceiverType('');
      setShowNewConversation(false);

      // Show success message
      alert('Conversation started successfully!');

      // Refresh conversations to show new conversation
      setTimeout(() => {
        fetchConversations();
      }, 500);

      // Auto-select the new conversation
      setTimeout(() => {
        const newConversation = {
          participant: {
            email: newConversationEmail.trim(),
            name: newConversationEmail.trim().split('@')[0],
            avatar: newConversationEmail.trim().charAt(0).toUpperCase(),
            profession: 'User',
            status: 'online'
          },
          id: newConversationEmail.trim().toLowerCase(),
          messages: [],
          lastMessage: conversationData.messageContent,
          lastMessageTime: 'now',
          messageCount: 1
        };
        setSelectedConversation(newConversation);
        setMessages([{
          ...response.data,
          id: response.data.id || Date.now()
        }]);
      }, 1000);

    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('The given Email does not exist , check your requests to find workers email, Please check the email and try again.');
      
    } finally {
      setStartingConversation(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const res = await axios.get('https://homemanagement-backend.onrender.com/api/conversation', {
        params: {
          user1: user_email,
          user2: conversation.participant.email
        }
      });
      console.log('Conversation messages:', res.data);
      // Sort messages chronologically for display
      const sortedMessages = res.data.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      // Use cached messages if available
      if (conversation.messages) {
        const sortedMessages = conversation.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        setMessages(sortedMessages);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversationKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartConversation();
    }
  };

  // Auto-resize textarea
  const handleMessageInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleNewConversationMessageChange = (e) => {
    setNewConversationMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-container">
      <div className="debug-info">
        You are {user_type === 'homeowner' ? 'Homeowner' : 'Worker'}: {user_email}
        <span style={{marginLeft: '20px'}}>
          WebSocket: {stompClient?.connected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        {conversations.length > 0 && (
          <span style={{marginLeft: '20px', color: '#28a745'}}>
            ✅ {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} loaded
          </span>
        )}
        <div style={{fontSize: '0.8rem', marginTop: '5px'}}>
          Debug: email={email || 'null'}, worker_email={worker_email || 'null'}
        </div>
      </div>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />

      <style>{`
        * {
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }

        .debug-info {
          background: #f0f8ff;
          padding: 10px;
          border-bottom: 2px solid #007bff;
          text-align: center;
          font-weight: 600;
          color: #007bff;
          font-size: 0.9rem;
        }

        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8f9fa;
          color: #343a40;
        }

        .chat-content {
          display: flex;
          flex: 1;
        }

        .chat-sidebar {
          width: 350px;
          background: #ffffff;
          border-right: 1px solid #dee2e6;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .chat-header {
          margin-bottom: 20px;
        }

        .chat-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 5px;
        }

        .chat-subtitle {
          font-size: 0.9rem;
          color: #6c757d;
        }

        .conversations-count {
          font-size: 0.8rem;
          color: #007bff;
          font-weight: 500;
          margin-top: 5px;
        }

        .new-conversation-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          width: 100%;
          justify-content: center;
        }

        .new-conversation-btn:hover {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .search-container {
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #495057;
          background: #f8f9fa;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          background: white;
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          padding: 15px;
          border-bottom: 1px solid #f1f3f5;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
          margin-bottom: 5px;
        }

        .conversation-item:hover {
          background: #f8f9fa;
          transform: translateX(5px);
        }

        .conversation-item.active {
          background: #e7f1ff;
          border-left: 4px solid #007bff;
        }

        .conversation-header {
          display: flex;
          align-items: center;
        }

        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          margin-right: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .conversation-info {
          flex: 1;
          min-width: 0;
        }

        .conversation-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .participant-name {
          font-weight: 600;
          color: #343a40;
          font-size: 0.95rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: #6c757d;
        }

        .participant-email {
          font-size: 0.8rem;
          color: #007bff;
          margin-bottom: 2px;
        }

        .last-message {
          font-size: 0.85rem;
          color: #6c757d;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
        }

        .message-count {
          background: #007bff;
          color: white;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 0.7rem;
          font-weight: 600;
          margin-left: 8px;
          flex-shrink: 0;
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          padding: 20px;
        }

        .chat-main-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f3f5;
        }

        .chat-participant-info {
          display: flex;
          align-items: center;
        }

        .chat-participant-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
          color: #ffffff;
          margin-right: 15px;
        }

        .chat-participant-details h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #343a40;
          margin: 0 0 2px 0;
        }

        .chat-participant-details p {
          font-size: 0.9rem;
          color: #6c757d;
          margin: 0;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
          max-height: 400px;
        }

        .message {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }

        .message.own {
          align-items: flex-end;
        }

        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
        }

        .message.own .message-content {
          background: #007bff;
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }

        .message:not(.own) .message-content {
          background: #ffffff;
          color: #343a40;
          border: 1px solid #e9ecef;
          border-bottom-left-radius: 4px;
        }

        .message-text {
          margin: 0;
          line-height: 1.4;
        }

        .message-timestamp {
          font-size: 0.75rem;
          margin-top: 4px;
        }

        .message.own .message-timestamp {
          color: rgba(255,255,255,0.7);
        }

        .message:not(.own) .message-timestamp {
          color: #6c757d;
        }

        .message-date {
          text-align: center;
          color: #6c757d;
          font-size: 0.8rem;
          margin: 20px 0 10px;
          padding: 5px 10px;
          background: rgba(108, 117, 125, 0.1);
          border-radius: 15px;
          align-self: center;
        }

        .message-input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ced4da;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #495057;
          resize: none;
          min-height: 44px;
          max-height: 120px;
          background: #f8f9fa;
          overflow-y: hidden;
        }

        .message-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          background: white;
        }

        .send-button {
          padding: 12px 20px;
          background: #007bff;
          color: #ffffff;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 80px;
          justify-content: center;
        }

        .send-button:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .send-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6c757d;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 20px;
          color: #dee2e6;
        }

        .empty-state h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .empty-state p {
          font-size: 0.9rem;
          text-align: center;
          max-width: 300px;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #6c757d;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* New Conversation Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 25px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #343a40;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          padding: 5px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: #f8f9fa;
          color: #343a40;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: #495057;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #495057;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          background: white;
        }

        .form-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #495057;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .form-select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          background: white;
        }

        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #495057;
          background: #f8f9fa;
          resize: vertical;
          min-height: 100px;
          max-height: 200px;
          transition: all 0.3s ease;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          background: white;
        }

        .receiver-type-info {
          background: #e7f1ff;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 0.85rem;
          color: #0056b3;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .cancel-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-button:hover {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .start-conversation-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .start-conversation-button:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .start-conversation-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .chat-sidebar {
            width: 100%;
            position: absolute;
            z-index: 1000;
            height: 100%;
          }

          .chat-main {
            display: ${selectedConversation ? 'flex' : 'none'};
          }

          .conversation-item:hover {
            transform: none;
          }

          .modal-content {
            padding: 20px;
            margin: 10px;
          }

          .modal-actions {
            flex-direction: column;
          }
        }

        /* Scrollbar Styling */
        .conversations-list::-webkit-scrollbar,
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .conversations-list::-webkit-scrollbar-track,
        .messages-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .conversations-list::-webkit-scrollbar-thumb,
        .messages-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .conversations-list::-webkit-scrollbar-thumb:hover,
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>

      <div className="chat-content">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-header">
            <h1 className="chat-title">Messages</h1>
            <p className="chat-subtitle">
              {user_type === 'homeowner' ? 'Connect with skilled workers' : 'Chat with homeowners'}
            </p>
            <div className="conversations-count">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </div>
          </div>

          <button 
            className="new-conversation-btn"
            onClick={() => setShowNewConversation(true)}
          >
            <i className="fas fa-plus"></i>
            Start New Conversation
          </button>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="conversations-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                Loading conversations...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="conversation-header">
                    <div className="avatar">{conversation.participant.avatar}</div>
                    <div className="conversation-info">
                      <div className="conversation-meta">
                        <div className="participant-name">{conversation.participant.name}</div>
                        <div className="message-time">{conversation.lastMessageTime}</div>
                      </div>
                      <div className="participant-email">{conversation.participant.email}</div>
                      <div className="last-message">
                        <span>{conversation.lastMessage}</span>
                        {conversation.messageCount > 0 && (
                          <span className="message-count">{conversation.messageCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-comments"></i>
                <h3>No conversations</h3>
                <p>Start chatting by clicking "Start New Conversation" above</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {selectedConversation ? (
            <>
              <div className="chat-main-header">
                <div className="chat-participant-info">
                  <div className="chat-participant-avatar">
                    {selectedConversation.participant.avatar}
                  </div>
                  <div className="chat-participant-details">
                    <h3>{selectedConversation.participant.name}</h3>
                    <p>{selectedConversation.participant.email}</p>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((message, index) => {
                  const showDate = index === 0 || 
                    formatDate(message.sentAt) !== formatDate(messages[index - 1].sentAt);
                  
                  return (
                    <React.Fragment key={message.id || index}>
                      {showDate && (
                        <div className="message-date">
                          {formatDate(message.sentAt)}
                        </div>
                      )}
                      <div className={`message ${message.senderEmail.toLowerCase() === user_email.toLowerCase() ? 'own' : ''}`}>
                        <div className="message-content">
                          <p className="message-text">{message.messageContent}</p>
                          <div className="message-timestamp">{formatTime(message.sentAt)}</div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                <textarea
                  className="message-input"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={handleMessageInputChange}
                  onKeyPress={handleKeyPress}
                  rows={1}
                  disabled={sendingMessage}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <>
                      <div className="spinner" style={{width: '14px', height: '14px', margin: 0}}></div>
                      Sending
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <i className="fas fa-comment-dots"></i>
              <h3>Select a conversation</h3>
              <p>Choose someone from the left to start chatting, or click "Start New Conversation" to reach out to someone new</p>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal with Receiver Type Selection */}
      {showNewConversation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Start New Conversation</h3>
              <button 
                className="close-button"
                onClick={() => setShowNewConversation(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="receiver-type-info">
              <i className="fas fa-info-circle"></i>
              {user_type === 'homeowner' 
                ? ' As a homeowner, you can message workers who are registered in our system.'
                : ' As a worker, you can message homeowners who are registered in our system.'}
            </div>

            <div className="form-group">
              <label className="form-label">Who are you messaging?</label>
              <select
                className="form-select"
                value={newConversationReceiverType}
                onChange={(e) => setNewConversationReceiverType(e.target.value)}
                disabled={startingConversation}
              >
                <option value="">Select recipient type...</option>
                <option value="homeowner">Homeowner</option>
                <option value="worker">Worker</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter email address..."
                value={newConversationEmail}
                onChange={(e) => setNewConversationEmail(e.target.value)}
                disabled={startingConversation}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                placeholder="Type your message..."
                value={newConversationMessage}
                onChange={handleNewConversationMessageChange}
                onKeyPress={handleNewConversationKeyPress}
                disabled={startingConversation}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowNewConversation(false)}
                disabled={startingConversation}
              >
                Cancel
              </button>
              <button
                className="start-conversation-button"
                onClick={handleStartConversation}
                disabled={!newConversationEmail.trim() || !newConversationMessage.trim() || !newConversationReceiverType || startingConversation}
              >
                {startingConversation ? (
                  <>
                    <div className="spinner" style={{width: '14px', height: '14px', margin: 0}}></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Start Conversation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ChatExperiment.propTypes = {
  email: PropTypes.string,
  worker_email: PropTypes.string
};

export default ChatExperiment;