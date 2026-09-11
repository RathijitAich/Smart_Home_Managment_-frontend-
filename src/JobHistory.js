import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const JobHistory = ({ worker_email, setWorkerEmail }) => {
  const navigate = useNavigate();
  const [completedJobs, setCompletedJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (worker_email) {
      fetchJobHistory();
      fetchReviews();
    }
  }, [worker_email]);

  const fetchJobHistory = async () => {
    try {
      const response = await fetch(`https://homemanagement-backend.onrender.com/api/job-applications/completed-jobs/worker/${encodeURIComponent(worker_email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job history');
      }
      
      const data = await response.json();
      setCompletedJobs(data);
      console.log('Fetched completed jobs:', data);
    } catch (err) {
      console.error('Error fetching job history:', err);
      setError('Failed to load job history');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`https://homemanagement-backend.onrender.com/api/reviews/worker/${encodeURIComponent(worker_email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
      setLoading(false);
    }
  };

  const getFilteredAndSortedJobs = () => {
    let filtered = completedJobs.filter(jobApp =>
      jobApp.job?.issueTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobApp.homeowner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobApp.job?.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => b.id - a.id);
      case 'oldest':
        return filtered.sort((a, b) => a.id - b.id);
      case 'title':
        return filtered.sort((a, b) => 
          (a.job?.issueTitle || '').localeCompare(b.job?.issueTitle || '')
        );
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return filtered.sort((a, b) => 
          (priorityOrder[b.job?.priorityLevel] || 0) - (priorityOrder[a.job?.priorityLevel] || 0)
        );
      default:
        return filtered;
    }
  };

  const getFilteredAndSortedReviews = () => {
    let filtered = reviews.filter(review =>
      review.job?.issueTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.homeowner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewText?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => b.id - a.id);
      case 'oldest':
        return filtered.sort((a, b) => a.id - b.id);
      case 'rating_desc':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'rating_asc':
        return filtered.sort((a, b) => a.rating - b.rating);
      default:
        return filtered;
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? '#FF9800' : '#E0E0E0',
          fontSize: '1.1rem',
          marginRight: '1px'
        }}
      >
        ★
      </span>
    ));
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: { backgroundColor: '#4CAF50', color: 'white' },
      approved: { backgroundColor: '#2196F3', color: 'white' },
      pending: { backgroundColor: '#FF9800', color: 'white' },
      rejected: { backgroundColor: '#F44336', color: 'white' }
    };

    const style = statusStyles[status?.toLowerCase()] || { backgroundColor: '#757575', color: 'white' };

    return (
      <span style={{
        ...style,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {status}
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getServiceTypeIcon = (serviceType) => {
    switch (serviceType?.toLowerCase()) {
      case 'electrical': return '⚡';
      case 'plumbing': return '🔧';
      case 'structural': return '🏗️';
      case 'landscaping': return '🌿';
      case 'pest': return '🐛';
      default: return '🔨';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#F5F7FA',
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '24px',
      color: '#2C3E50',
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px',
      position: 'relative',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '8px',
      color: '#2C3E50',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#7F8C8D',
      marginBottom: '24px',
    },
    backBtn: {
      position: 'absolute',
      top: '0',
      left: '0',
      background: '#FFFFFF',
      color: '#2C3E50',
      border: '2px solid #E8EAED',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    statsCard: {
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid #E8EAED',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '16px',
    },
    statItem: {
      background: '#F8F9FA',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      border: '1px solid #E8EAED',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2C3E50',
      marginBottom: '8px',
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#7F8C8D',
      fontWeight: '500',
    },
    controlsContainer: {
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid #E8EAED',
    },
    tabContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      borderBottom: '2px solid #F8F9FA',
      paddingBottom: '16px',
    },
    tab: {
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: '600',
      border: 'none',
      background: '#F8F9FA',
      color: '#7F8C8D',
      fontSize: '0.95rem',
    },
    activeTab: {
      background: '#4CAF50',
      color: '#FFFFFF',
    },
    filtersContainer: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    searchInput: {
      flex: '1',
      minWidth: '250px',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '2px solid #E8EAED',
      background: '#FFFFFF',
      fontSize: '1rem',
      transition: 'border-color 0.3s ease',
    },
    sortSelect: {
      padding: '12px 16px',
      borderRadius: '12px',
      border: '2px solid #E8EAED',
      background: '#FFFFFF',
      fontSize: '1rem',
      cursor: 'pointer',
      fontWeight: '500',
    },
    jobsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '20px',
    },
    jobCard: {
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #E8EAED',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    jobHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
    },
    jobTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '8px',
      lineHeight: '1.4',
      color: '#2C3E50',
    },
    jobId: {
      fontSize: '0.8rem',
      color: '#7F8C8D',
      background: '#F8F9FA',
      padding: '4px 8px',
      borderRadius: '6px',
      fontWeight: '500',
    },
    jobDetails: {
      marginTop: '16px',
    },
    jobDetail: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #F8F9FA',
      fontSize: '0.9rem',
    },
    jobDetailLabel: {
      color: '#7F8C8D',
      fontWeight: '500',
    },
    jobDetailValue: {
      color: '#2C3E50',
      fontWeight: '600',
    },
    reviewsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    reviewCard: {
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #E8EAED',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    reviewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
    },
    reviewUserInfo: {
      flex: 1,
    },
    reviewUserName: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2C3E50',
      marginBottom: '4px',
    },
    reviewJobTitle: {
      fontSize: '0.9rem',
      color: '#7F8C8D',
      fontWeight: '500',
    },
    reviewRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    reviewText: {
      lineHeight: '1.6',
      color: '#2C3E50',
      fontSize: '0.95rem',
      marginTop: '12px',
      padding: '12px',
      background: '#F8F9FA',
      borderRadius: '8px',
      borderLeft: '4px solid #4CAF50',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontSize: '1.2rem',
      color: '#7F8C8D',
    },
    errorContainer: {
      background: '#FFFFFF',
      border: '2px solid #F44336',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 4px 16px rgba(244,67,54,0.1)',
    },
    noDataMessage: {
      textAlign: 'center',
      padding: '48px',
      fontSize: '1.1rem',
      color: '#7F8C8D',
      background: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E8EAED',
    },
    priorityBadge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      color: 'white',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div>📋 Loading job history...</div>
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
            onClick={() => navigate('/worker-dashboard')}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ← Back
          </button>
          <h1 style={styles.title}>📋 Job History</h1>
        </div>
        
        <div style={styles.errorContainer}>
          <h3 style={{ color: '#F44336', marginBottom: '16px' }}>⚠️ Error Loading Data</h3>
          <p style={{ color: '#7F8C8D', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#4CAF50',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredJobs = getFilteredAndSortedJobs();
  const filteredReviews = getFilteredAndSortedReviews();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          style={styles.backBtn}
          onClick={() => navigate('/worker-dashboard')}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          ← Back
        </button>
        <h1 style={styles.title}>📋 Job History</h1>
        <p style={styles.subtitle}>Track your completed work and customer feedback</p>
      </div>

      {/* Statistics Card */}
      <div style={styles.statsCard}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#2C3E50' }}>
          📊 Performance Overview
        </h2>
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{completedJobs.length}</div>
            <div style={styles.statLabel}>Completed Jobs</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{reviews.length}</div>
            <div style={styles.statLabel}>Customer Reviews</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{getAverageRating()}</div>
            <div style={styles.statLabel}>Average Rating</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>
              {reviews.filter(r => r.rating >= 4).length}
            </div>
            <div style={styles.statLabel}>4+ Star Reviews</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controlsContainer}>
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'jobs' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('jobs')}
          >
            💼 Completed Jobs ({completedJobs.length})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'reviews' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Customer Reviews ({reviews.length})
          </button>
        </div>

        <div style={styles.filtersContainer}>
          <input
            type="text"
            placeholder={activeTab === 'jobs' ? "Search jobs by title, type, or client..." : "Search reviews..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
            onBlur={(e) => e.target.style.borderColor = '#E8EAED'}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            {activeTab === 'jobs' && (
              <>
                <option value="title">By Title</option>
                <option value="priority">By Priority</option>
              </>
            )}
            {activeTab === 'reviews' && (
              <>
                <option value="rating_desc">Highest Rating</option>
                <option value="rating_asc">Lowest Rating</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'jobs' ? (
        <div style={styles.jobsGrid}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((jobApp) => (
              <div
                key={jobApp.id}
                style={styles.jobCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                <div style={styles.jobHeader}>
                  <div>
                    <div style={styles.jobTitle}>
                      {getServiceTypeIcon(jobApp.job?.serviceType)} {jobApp.job?.issueTitle}
                    </div>
                    <div style={styles.jobId}>Application ID: #{jobApp.id}</div>
                  </div>
                  {getStatusBadge(jobApp.applicationStatus)}
                </div>

                <div style={styles.jobDetails}>
                  <div style={styles.jobDetail}>
                    <span style={styles.jobDetailLabel}>👤 Client:</span>
                    <span style={styles.jobDetailValue}>{jobApp.homeowner?.name}</span>
                  </div>
                  <div style={styles.jobDetail}>
                    <span style={styles.jobDetailLabel}>📧 Email:</span>
                    <span style={styles.jobDetailValue}>{jobApp.homeowner?.email}</span>
                  </div>
                  <div style={styles.jobDetail}>
                    <span style={styles.jobDetailLabel}>🏠 Location:</span>
                    <span style={styles.jobDetailValue}>{jobApp.job?.roomLocation}</span>
                  </div>
                  <div style={styles.jobDetail}>
                    <span style={styles.jobDetailLabel}>🔧 Service:</span>
                    <span style={styles.jobDetailValue}>{jobApp.job?.serviceType}</span>
                  </div>
                  <div style={styles.jobDetail}>
                    <span style={styles.jobDetailLabel}>⚡ Priority:</span>
                    <span 
                      style={{
                        ...styles.priorityBadge,
                        backgroundColor: getPriorityColor(jobApp.job?.priorityLevel)
                      }}
                    >
                      {jobApp.job?.priorityLevel}
                    </span>
                  </div>
                  <div style={styles.jobDetail}>
                    <span style={styles.jobDetailLabel}>📅 Date:</span>
                    <span style={styles.jobDetailValue}>{jobApp.job?.preferredDate}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.noDataMessage}>
              <h3>📭 No completed jobs found</h3>
              <p>Complete some jobs to see them here!</p>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.reviewsContainer}>
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewUserInfo}>
                    <div style={styles.reviewUserName}>
                      {review.homeowner?.name || 'Anonymous Customer'}
                    </div>
                    <div style={styles.reviewJobTitle}>
                      🔧 {review.job?.issueTitle || 'General Service'}
                    </div>
                  </div>
                  <div style={styles.reviewRating}>
                    {getRatingStars(review.rating)}
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2C3E50' }}>
                      {review.rating}/5
                    </span>
                  </div>
                </div>
                
                <div style={styles.reviewText}>
                  "{review.reviewText}"
                </div>
              </div>
            ))
          ) : (
            <div style={styles.noDataMessage}>
              <h3>⭐ No reviews yet</h3>
              <p>Complete jobs and receive customer feedback to see reviews here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

JobHistory.propTypes = {
  worker_email: PropTypes.string.isRequired,
  setWorkerEmail: PropTypes.func.isRequired,
};

export default JobHistory;