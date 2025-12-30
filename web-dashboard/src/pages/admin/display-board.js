import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiRefreshCw, FiMonitor } from 'react-icons/fi';
import { MdQueue, MdAccessTime } from 'react-icons/md';
import apiClient from '../../lib/api';
import { isAuthenticated, getStoredUser } from '../../lib/auth';

export default function DisplayBoard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('');
  const [services, setServices] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentUser = getStoredUser();
    if (currentUser) {
      setUser(currentUser);
    }

    loadServices();
    loadDisplayData();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Auto-refresh data every 5 seconds
    const dataInterval = setInterval(() => {
      loadDisplayData();
    }, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, [selectedService]);

  const loadServices = async () => {
    try {
      const response = await apiClient.get('/admin/services');
      if (response.success) {
        setServices(response.data.filter(s => s.is_active));
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadDisplayData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedService) params.append('service_id', selectedService);

      const response = await apiClient.get(`/admin/display-board?${params.toString()}`);
      if (response.success) {
        setDisplayData(response.data);
      }
    } catch (error) {
      console.error('Error loading display data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  if (loading && !displayData) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <FiRefreshCw style={styles.spinner} className="spin" />
          <p style={styles.loadingText}>Loading display board...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Control Bar (hidden in fullscreen) */}
      {!isFullscreen && (
        <div style={styles.controlBar}>
          <div style={styles.controlLeft}>
            <div style={styles.logoSection}>
              <img src="/logo.png" alt="QTech" style={styles.logoImage} />
              <h1 style={styles.controlTitle}>Display Board</h1>
            </div>
          </div>
          <div style={styles.controlRight}>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              style={styles.serviceSelect}
            >
              <option value="">All Services</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            <button onClick={loadDisplayData} style={styles.refreshButton}>
              <FiRefreshCw size={18} />
              Refresh
            </button>
            <button onClick={toggleFullscreen} style={styles.fullscreenButton}>
              <FiMonitor size={18} />
              Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Display Board Content */}
      <div style={styles.displayContent}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoWrapper}>
              <img src="/logo.png" alt="QTech" style={styles.headerLogo} />
            </div>
            <div style={styles.titleSection}>
              <h1 style={styles.headerTitle}>QTech Queue System</h1>
              <p style={styles.headerSubtitle}>
                {selectedService 
                  ? services.find(s => s.id === parseInt(selectedService))?.name || 'Service'
                  : 'All Services'}
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.timeWrapper}>
              <div style={styles.timeDisplay}>
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
              <div style={styles.dateDisplay}>
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={styles.mainGrid}>
          {/* Left Column - Currently Serving */}
          <div style={styles.leftColumn}>
            <div style={styles.servingSection}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIcon}>
                  <MdAccessTime size={36} />
                </div>
                <h2 style={styles.sectionTitle}>Currently Serving</h2>
              </div>
              <div style={styles.servingContent}>
                {displayData?.serving && displayData.serving.length > 0 ? (
                  <div style={styles.servingList} className="serving-list">
                    {displayData.serving.map((queue) => (
                      <div key={queue.id} style={styles.servingCard}>
                        <div style={styles.queueNumberLarge}>{queue.queue_number}</div>
                        <div style={styles.queueInfo}>
                          <div style={styles.serviceName}>{queue.service_name}</div>
                          {queue.counter_name && (
                            <div style={styles.counterInfo}>
                              <span style={styles.counterLabel}>Counter {queue.counter_number}</span>
                              <span style={styles.counterName}>{queue.counter_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <MdQueue size={100} color="#475569" />
                    <p style={styles.emptyText}>No queues currently being served</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* Next in Line */}
            <div style={styles.calledSection}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIcon}>
                  <FiRefreshCw size={28} />
                </div>
                <h2 style={styles.sectionTitle}>Next in Line</h2>
              </div>
              <div style={styles.calledContent}>
                {displayData?.called && displayData.called.length > 0 ? (
                  <div style={styles.calledList} className="called-list">
                    {displayData.called.map((queue) => (
                      <div key={queue.id} style={styles.calledCard}>
                        <div style={styles.queueNumberMedium}>{queue.queue_number}</div>
                        <div style={styles.queueInfo}>
                          <div style={styles.serviceNameSmall}>{queue.service_name}</div>
                          {queue.counter_name && (
                            <div style={styles.counterInfoSmall}>
                              Counter {queue.counter_number}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyStateSmall}>
                    <p style={styles.emptyTextSmall}>No queues called</p>
                  </div>
                )}
              </div>
            </div>

            {/* Waiting Counts */}
            <div style={styles.waitingSection}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIcon}>
                  <MdQueue size={28} />
                </div>
                <h2 style={styles.sectionTitle}>Waiting</h2>
              </div>
              <div style={styles.waitingContent}>
                {displayData?.waiting && displayData.waiting.length > 0 ? (
                  <div style={styles.waitingGrid} className="waiting-grid">
                    {displayData.waiting.map((service) => (
                      <div key={service.service_id} style={styles.waitingCard}>
                        <div style={styles.waitingServiceName}>{service.service_name}</div>
                        <div style={styles.waitingCount}>{service.waiting_count}</div>
                        <div style={styles.waitingLabel}>in queue</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyStateSmall}>
                    <p style={styles.emptyTextSmall}>No waiting queues</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Running Text Banner */}
        <div style={styles.marqueeContainer}>
          <div style={styles.marqueeWrapper}>
            <div style={styles.marqueeContent}>
              <span style={styles.marqueeText}>
                🎉 Welcome to QTech Queue Management System! 🎉 Experience a smarter way to manage queues. No more waiting in long lines - get your queue number from your mobile app and track your position in real-time. You'll receive notifications when it's your turn. Thank you for using our modern queue system! For assistance, please contact our staff.
              </span>
              <span style={styles.marqueeText}>
                🎉 Welcome to QTech Queue Management System! 🎉 Experience a smarter way to manage queues. No more waiting in long lines - get your queue number from your mobile app and track your position in real-time. You'll receive notifications when it's your turn. Thank you for using our modern queue system! For assistance, please contact our staff.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0e27',
    color: 'white',
    overflow: 'hidden',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  spinner: {
    color: '#dc2626',
    marginBottom: '24px',
  },
  loadingText: {
    color: '#cbd5e0',
    fontSize: '24px',
    fontWeight: '500',
  },
  controlBar: {
    backgroundColor: '#1a1f3a',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #2d3748',
    zIndex: 1000,
  },
  controlLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoImage: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  controlTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
  },
  controlRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  serviceSelect: {
    padding: '10px 16px',
    backgroundColor: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  fullscreenButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  displayContent: {
    padding: '32px 40px',
    maxWidth: '1920px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 73px)',
    overflow: 'visible',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '2px solid #1e293b',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logoWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '16px',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: '48px',
    fontWeight: '900',
    color: '#dc2626',
    margin: 0,
    letterSpacing: '-1px',
    lineHeight: '1.1',
  },
  headerSubtitle: {
    fontSize: '22px',
    color: '#94a3b8',
    margin: '4px 0 0 0',
    fontWeight: '500',
  },
  headerRight: {
    textAlign: 'right',
  },
  timeWrapper: {
    backgroundColor: '#1e293b',
    padding: '16px 24px',
    borderRadius: '12px',
    border: '2px solid #334155',
  },
  timeDisplay: {
    fontSize: '56px',
    fontWeight: '700',
    color: '#10b981',
    fontFamily: 'monospace',
    lineHeight: '1',
  },
  dateDisplay: {
    fontSize: '18px',
    color: '#cbd5e0',
    marginTop: '8px',
    fontWeight: '500',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1fr',
    gap: '32px',
    flex: 1,
    marginBottom: '16px',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  servingSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1f3a',
    borderRadius: '20px',
    padding: '28px',
    border: '2px solid #2d3748',
    overflow: 'visible',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #2d3748',
    flexShrink: 0,
  },
  sectionIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#dc2626',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  servingContent: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
  },
  servingList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflow: 'visible',
  },
  servingCard: {
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    padding: '28px',
    border: '3px solid #dc2626',
    boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
    textAlign: 'center',
  },
  queueNumberLarge: {
    fontSize: '120px',
    fontWeight: '900',
    color: '#dc2626',
    lineHeight: '1',
    marginBottom: '16px',
    fontFamily: 'monospace',
    textShadow: '0 4px 20px rgba(220, 38, 38, 0.6)',
  },
  queueInfo: {
    marginTop: '16px',
  },
  serviceName: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '8px',
  },
  counterInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '12px',
  },
  counterLabel: {
    fontSize: '22px',
    color: '#94a3b8',
    fontWeight: '600',
  },
  counterName: {
    fontSize: '20px',
    color: '#cbd5e0',
  },
  calledSection: {
    backgroundColor: '#1a1f3a',
    borderRadius: '16px',
    padding: '20px',
    border: '2px solid #2d3748',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'visible',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  calledContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'visible',
  },
  calledList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflow: 'visible',
  },
  calledCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '16px',
    border: '2px solid #3b82f6',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
  },
  queueNumberMedium: {
    fontSize: '56px',
    fontWeight: '800',
    color: '#3b82f6',
    lineHeight: '1',
    marginBottom: '8px',
    fontFamily: 'monospace',
  },
  serviceNameSmall: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '6px',
  },
  counterInfoSmall: {
    fontSize: '16px',
    color: '#94a3b8',
  },
  waitingSection: {
    backgroundColor: '#1a1f3a',
    borderRadius: '16px',
    padding: '20px',
    border: '2px solid #2d3748',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'visible',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  waitingContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'visible',
  },
  waitingGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    overflow: 'visible',
    gridAutoRows: 'min-content',
  },
  waitingCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '16px',
    border: '2px solid #475569',
    textAlign: 'center',
    flexShrink: 0,
  },
  waitingServiceName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#cbd5e0',
    marginBottom: '8px',
  },
  waitingCount: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#f59e0b',
    lineHeight: '1',
    margin: '8px 0',
  },
  waitingLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
  },
  emptyText: {
    fontSize: '24px',
    color: '#64748b',
    marginTop: '20px',
    fontWeight: '500',
  },
  emptyStateSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '20px',
  },
  emptyTextSmall: {
    fontSize: '18px',
    color: '#64748b',
    fontWeight: '500',
  },
  marqueeContainer: {
    backgroundColor: '#dc2626',
    padding: '24px 0',
    marginTop: 'auto',
    overflow: 'hidden',
    position: 'relative',
    borderTop: '3px solid #991b1b',
    borderBottom: '3px solid #991b1b',
    boxShadow: '0 -4px 20px rgba(220, 38, 38, 0.4)',
    flexShrink: 0,
  },
  marqueeWrapper: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  marqueeContent: {
    display: 'inline-flex',
    whiteSpace: 'nowrap',
    animation: 'marquee 60s linear infinite',
    willChange: 'transform',
  },
  marqueeText: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'white',
    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
    letterSpacing: '2px',
    paddingRight: '200px',
    display: 'inline-block',
  },
};

// Add marquee animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes marquee {
      0% {
        transform: translateX(100vw);
      }
      100% {
        transform: translateX(-50%);
      }
    }
  `;
  if (!document.head.querySelector('style[data-marquee-animation]')) {
    style.setAttribute('data-marquee-animation', 'true');
    document.head.appendChild(style);
  }
}
