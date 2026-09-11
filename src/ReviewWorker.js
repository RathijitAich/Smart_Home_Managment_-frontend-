import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const ReviewWorker = ({ email, setEmail }) => {
  const [unreviewedJobs, setUnreviewedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [notification, setNotification] = useState(null);

  //  Get current user email
  const currentEmail = localStorage.getItem("email") || email;

  // Fetch unreviewed completed jobs
  const fetchUnreviewedJobs = async () => {
    if (!currentEmail) {
      setError("No email found. Please login first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`https://homemanagement-backend.onrender.com/api/job-applications/unreviewed-jobs/homeowner/${encodeURIComponent(currentEmail)}`);
      console.log('Unreviewed jobs response:', response.data);
      setUnreviewedJobs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching unreviewed jobs:', err);
      setError(err.response?.data?.message || 'Failed to fetch unreviewed jobs');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUnreviewedJobs();
  }, [currentEmail]);

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob || !reviewForm.reviewText.trim()) {
      setNotification({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData = {
        homeownerEmail: currentEmail,
        workerEmail: selectedJob.worker.email,
        issueTitle: selectedJob.job.issueTitle,
        reviewText: reviewForm.reviewText.trim(),
        rating: reviewForm.rating
      };

      const response = await axios.post('https://homemanagement-backend.onrender.com/api/reviews', reviewData);
      console.log('Review submitted:', response.data);
      
      setNotification({ type: 'success', message: 'Review submitted successfully!' });
      setShowReviewModal(false);
      setReviewForm({ rating: 5, reviewText: '' });
      setSelectedJob(null);

      // Refetch unreviewed jobs after successful submission
      await fetchUnreviewedJobs();

    } catch (err) {
      console.error('Error submitting review:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit review';
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Open review modal
  const handleOpenReview = (job) => {
    setSelectedJob(job);
    setShowReviewModal(true);
    setReviewForm({ rating: 5, reviewText: '' });
  };

  // Close review modal
  const handleCloseReview = () => {
    setShowReviewModal(false);
    setSelectedJob(null);
    setReviewForm({ rating: 5, reviewText: '' });
  };

  // Handle notification auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return { bg: '#fed7d7', color: '#9b2c2c' };
      case 'medium': return { bg: '#fef5e7', color: '#d69e2e' };
      case 'low': return { bg: '#c6f6d5', color: '#22543d' };
      default: return { bg: '#e2e8f0', color: '#4a5568' };
    }
  };

  // Get service type display name
  const getServiceTypeDisplay = (serviceType) => {
    return serviceType ? serviceType.charAt(0).toUpperCase() + serviceType.slice(1) : 'N/A';
  };

  // Render star rating
  const renderStarRating = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="review-worker-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading jobs pending review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-worker-container">
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchUnreviewedJobs} className="retry-button">
            <i className="fas fa-refresh"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-worker-container">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" />

      <style>{`
        * {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .review-worker-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 2rem;
          position: relative;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .header p {
          font-size: 1.1rem;
          color: #718096;
          margin-bottom: 1rem;
        }

        .stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          min-width: 150px;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #4299e1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #718096;
          margin-top: 0.5rem;
        }

        .pending-badge {
          background: #fef5e7;
          color: #d69e2e;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          margin-left: 0.5rem;
        }

        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .job-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
          position: relative;
        }

        .job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .review-pending-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #fef5e7;
          color: #d69e2e;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          border: 1px solid #f6e05e;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          margin-top: 1rem;
        }

        .job-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .job-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }

        .service-type-badge {
          background: #e6fffa;
          color: #234e52;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .room-location-badge {
          background: #ebf8ff;
          color: #2a4365;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .priority-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge {
          background: #c6f6d5;
          color: #22543d;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .job-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.8rem;
          color: #718096;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.95rem;
          color: #2d3748;
          font-weight: 500;
        }

        .worker-info {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .worker-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .worker-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.2rem;
          margin-right: 1rem;
        }

        .worker-details h4 {
          font-size: 1.1rem;
          color: #2d3748;
          margin-bottom: 0.25rem;
        }

        .worker-details p {
          font-size: 0.9rem;
          color: #718096;
        }

        .worker-contact {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }

        .description {
          margin-bottom: 1.5rem;
        }

        .description h4 {
          font-size: 1rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .description p {
          color: #4a5568;
          line-height: 1.6;
        }

        .job-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .review-button {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .review-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .contact-button {
          flex: 1;
          background: white;
          color: #4299e1;
          border: 2px solid #4299e1;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .contact-button:hover {
          background: #4299e1;
          color: white;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4299e1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container i {
          font-size: 3rem;
          color: #f56565;
          margin-bottom: 1rem;
        }

        .retry-button {
          background: #4299e1;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #718096;
        }

        .empty-state i {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #cbd5e0;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #4a5568;
        }

        .access-info {
          background: #f0fff4;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border-left: 4px solid #68d391;
        }

        .access-info h4 {
          font-size: 0.9rem;
          color: #22543d;
          margin-bottom: 0.5rem;
        }

        .access-info p {
          font-size: 0.85rem;
          color: #2f855a;
        }

        /* Review Modal Styles */
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
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #718096;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .job-summary {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .job-summary h4 {
          font-size: 1rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .job-summary p {
          font-size: 0.9rem;
          color: #718096;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .star-rating {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }

        .star {
          font-size: 1.5rem;
          color: #e2e8f0;
          cursor: default;
          transition: color 0.2s ease;
        }

        .star.filled {
          color: #f6e05e;
        }

        .star.interactive {
          cursor: pointer;
        }

        .star.interactive:hover {
          color: #f6e05e;
        }

        .form-textarea {
          width: 100%;
          min-height: 120px;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          resize: vertical;
          transition: border-color 0.3s ease;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .cancel-button {
          background: white;
          color: #718096;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-button:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }

        .submit-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Notification Styles */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1001;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }

        .notification.success {
          background: #c6f6d5;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }

        .notification.error {
          background: #fed7d7;
          color: #9b2c2c;
          border: 1px solid #fc8181;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .review-worker-container {
            padding: 1rem;
          }

          .jobs-grid {
            grid-template-columns: 1fr;
          }

          .job-details {
            grid-template-columns: 1fr;
          }

          .worker-contact {
            grid-template-columns: 1fr;
          }

          .job-actions {
            flex-direction: column;
          }

          .stats {
            flex-direction: column;
            align-items: center;
          }

          .header h1 {
            font-size: 2rem;
          }

          .job-meta {
            flex-direction: column;
          }

          .modal-content {
            margin: 1rem;
            padding: 1.5rem;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="header">
        <h1>
          <i className="fas fa-star"></i>
          Review Completed Jobs
        </h1>
        <p>Rate and review your completed maintenance jobs</p>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{unreviewedJobs.length}</div>
            <div className="stat-label">Pending Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{new Set(unreviewedJobs.map(job => job.worker?.email)).size}</div>
            <div className="stat-label">Workers to Review</div>
          </div>
        </div>
      </div>

      {unreviewedJobs.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-clipboard-check"></i>
          <h3>All Caught Up!</h3>
          <p>You have no pending reviews. All your completed jobs have been reviewed. Great job staying on top of your feedback!</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {unreviewedJobs.map((assignment) => (
            <div key={assignment.id} className="job-card">
              <div className="review-pending-indicator">
                <i className="fas fa-exclamation-circle"></i>
                Review Pending
              </div>
              
              <div className="job-header">
                <div>
                  <h3 className="job-title">{assignment.job?.issueTitle || 'Maintenance Job'}</h3>
                  <div className="job-meta">
                    <span className="service-type-badge">
                      {getServiceTypeDisplay(assignment.job?.serviceType)}
                    </span>
                    <span className="room-location-badge">
                      {assignment.job?.roomLocation || 'N/A'}
                    </span>
                    <span 
                      className="priority-badge"
                      style={{
                        backgroundColor: getPriorityColor(assignment.job?.priorityLevel).bg,
                        color: getPriorityColor(assignment.job?.priorityLevel).color
                      }}
                    >
                      {assignment.job?.priorityLevel || 'Normal'} Priority
                    </span>
                  </div>
                </div>
                <div className="status-badge">
                  <i className="fas fa-check-circle"></i>
                  {assignment.applicationStatus}
                </div>
              </div>

              <div className="job-details">
                <div className="detail-item">
                  <span className="detail-label">Job ID</span>
                  <span className="detail-value">#{assignment.job?.id || assignment.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Preferred Date</span>
                  <span className="detail-value">{formatDate(assignment.job?.preferredDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Preferred Time</span>
                  <span className="detail-value">{assignment.job?.preferredTime || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Job Status</span>
                  <span className="detail-value">{assignment.job?.jobStatus || 'N/A'}</span>
                </div>
              </div>

              <div className="worker-info">
                <div className="worker-header">
                  <div className="worker-avatar">
                    {assignment.worker?.name ? assignment.worker.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div className="worker-details">
                    <h4>{assignment.worker?.name || 'Worker'}</h4>
                    <p>{assignment.worker?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="worker-contact">
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{assignment.worker?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Skill</span>
                    <span className="detail-value">{assignment.worker?.skill || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{assignment.worker?.address || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Rating</span>
                    <span className="detail-value">{assignment.worker?.rating || 'Not rated yet'}</span>
                  </div>
                </div>
              </div>

              {assignment.job?.issueDescription && (
                <div className="description">
                  <h4>Job Description</h4>
                  <p>{assignment.job.issueDescription}</p>
                </div>
              )}

              {assignment.job?.accessInstructions && (
                <div className="access-info">
                  <h4>Access Instructions</h4>
                  <p>{assignment.job.accessInstructions}</p>
                </div>
              )}

              <div className="job-actions">
                <button 
                  className="review-button"
                  onClick={() => handleOpenReview(assignment)}
                >
                  <i className="fas fa-star"></i>
                  Write Review
                </button>
                <button className="contact-button">
                  <i className="fas fa-envelope"></i>
                  Contact Worker
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Write Your Review</h3>
              <button className="close-button" onClick={handleCloseReview}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="job-summary">
              <h4>{selectedJob.job?.issueTitle}</h4>
              <p>Worker: {selectedJob.worker?.name} ({selectedJob.worker?.email})</p>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Your Rating</label>
                {renderStarRating(
                  reviewForm.rating, 
                  true, 
                  (rating) => setReviewForm(prev => ({ ...prev, rating }))
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea
                  className="form-textarea"
                  placeholder="How was your experience with this worker? Share details about their work quality, professionalism, timeliness, etc."
                  value={reviewForm.reviewText}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={handleCloseReview}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={submittingReview || !reviewForm.reviewText.trim()}
                >
                  {submittingReview ? (
                    <>
                      <div className="spinner" style={{width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff'}}></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {notification.message}
        </div>
      )}
    </div>
  );
};

ReviewWorker.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
};

export default ReviewWorker;