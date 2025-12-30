import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiRefreshCw, FiMonitor } from 'react-icons/fi';
import { MdQueue, MdAccessTime, MdCheckCircle } from 'react-icons/md';
import { HiOutlineClock } from 'react-icons/hi';
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
  const [logoPosition, setLogoPosition] = useState(0);

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

    // Animate logo
    const logoInterval = setInterval(() => {
      setLogoPosition(prev => (prev + 1) % 100);
    }, 50);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
      clearInterval(logoInterval);
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
          <div style={styles.loadingSpinner}></div>
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
        {/* Professional Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoContainer}>
              <div style={styles.logoAnimationWrapper}>
                <img 
                  src="/logo.png" 
                  alt="QTech" 
                  style={{
                    ...styles.headerLogo,
                    transform: `translateX(${Math.sin(logoPosition * 0.1) * 5}px)`,
                    transition: 'transform 0.3s ease-out'
                  }} 
                />
              </div>
            </div>
            <div style={styles.titleSection}>
              <h1 style={styles.headerTitle}>QTech Queue Management System</h1>
              <p style={styles.headerSubtitle}>
                {selectedService 
                  ? services.find(s => s.id === parseInt(selectedService))?.name || 'Service'
                  : 'All Services'}
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.timeCard}>
              <HiOutlineClock size={32} style={styles.clockIcon} />
              <div style={styles.timeContent}>
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
        </div>

        {/* Main Content Grid */}
        <div style={styles.mainGrid}>
          {/* Currently Serving - Prominent Section */}
          <div style={styles.servingColumn}>
            <div style={styles.servingSection}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrapper}>
                  <MdCheckCircle size={32} />
                </div>
                <h2 style={styles.sectionTitle}>Currently Serving</h2>
              </div>
              <div style={styles.servingContent}>
                {displayData?.serving && displayData.serving.length > 0 ? (
                  <div style={styles.servingGrid}>
                    {displayData.serving.map((queue, index) => (
                      <div 
                        key={queue.id} 
                        style={{
                          ...styles.servingCard,
                          animationDelay: `${index * 0.2}s`
                        }}
                        className="serving-card"
                      >
                        <div style={styles.queueNumberContainer}>
                          <div style={styles.queueNumberLarge}>{queue.queue_number}</div>
                          <div style={styles.queueBadge}>NOW SERVING</div>
                        </div>
                        <div style={styles.queueDetails}>
                          <div style={styles.serviceNameLarge}>{queue.service_name}</div>
                          {queue.counter_name && (
                            <div style={styles.counterBadge}>
                              <span style={styles.counterIcon}>📍</span>
                              Counter {queue.counter_number} • {queue.counter_name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <MdQueue size={80} style={styles.emptyIcon} />
                    <p style={styles.emptyText}>No queues currently being served</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Next in Line & Waiting */}
          <div style={styles.rightColumn}>
            {/* Next in Line */}
            <div style={styles.calledSection}>
              <div style={styles.sectionHeaderSmall}>
                <div style={styles.sectionIconSmall}>
                  <MdAccessTime size={24} />
                </div>
                <h3 style={styles.sectionTitleSmall}>Next in Line</h3>
              </div>
              <div style={styles.calledContent}>
                {displayData?.called && displayData.called.length > 0 ? (
                  <div style={styles.calledList}>
                    {displayData.called.map((queue, index) => (
                      <div 
                        key={queue.id} 
                        style={{
                          ...styles.calledCard,
                          animationDelay: `${index * 0.1}s`
                        }}
                        className="called-card"
                      >
                        <div style={styles.queueNumberMedium}>{queue.queue_number}</div>
                        <div style={styles.queueInfoSmall}>
                          <div style={styles.serviceNameMedium}>{queue.service_name}</div>
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
              <div style={styles.sectionHeaderSmall}>
                <div style={styles.sectionIconSmall}>
                  <MdQueue size={24} />
                </div>
                <h3 style={styles.sectionTitleSmall}>Waiting</h3>
              </div>
              <div style={styles.waitingContent}>
                {displayData?.waiting && displayData.waiting.length > 0 ? (
                  <div style={styles.waitingGrid}>
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

        {/* Professional Running Banner */}
        <div style={styles.bannerContainer}>
          <div style={styles.bannerContent}>
            <div style={styles.bannerLogo}>
              <img src="/logo.png" alt="QTech" style={styles.bannerLogoImg} />
            </div>
            <div style={styles.bannerText}>
              Welcome to QTech Queue Management System • Experience smart queue management • Get your queue number from the mobile app • Track your position in real-time • Receive notifications when it's your turn • Thank you for using our modern queue system
            </div>
            <div style={styles.bannerLogo}>
              <img src="/logo.png" alt="QTech" style={styles.bannerLogoImg} />
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
    backgroundColor: '#0f172a',
    color: '#ffffff',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    gap: '24px',
  },
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(220, 38, 38, 0.2)',
    borderTop: '4px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#cbd5e0',
    fontSize: '20px',
    fontWeight: '500',
  },
  controlBar: {
    backgroundColor: '#1e293b',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #334155',
    zIndex: 1000,
  },
  controlLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoImage: {
    width: '32px',
    height: '32px',
    objectFit: 'contain',
  },
  controlTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    margin: 0,
  },
  controlRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  serviceSelect: {
    padding: '8px 16px',
    backgroundColor: '#334155',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#334155',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  fullscreenButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  displayContent: {
    padding: '24px 32px',
    maxWidth: '1920px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 73px)',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  logoContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    border: '2px solid #334155',
  },
  logoAnimationWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.5))',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
    fontWeight: '500',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  timeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    border: '1px solid #334155',
  },
  clockIcon: {
    color: '#10b981',
  },
  timeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  timeDisplay: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#10b981',
    fontFamily: 'monospace',
    lineHeight: '1',
  },
  dateDisplay: {
    fontSize: '12px',
    color: '#cbd5e0',
    fontWeight: '500',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
    flex: 1,
  },
  servingColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  servingSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #334155',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #334155',
  },
  sectionIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  servingContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  servingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  servingCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '24px',
    border: '3px solid #dc2626',
    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4)',
    textAlign: 'center',
    animation: 'slideInUp 0.6s ease-out',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  queueNumberContainer: {
    marginBottom: '16px',
  },
  queueNumberLarge: {
    fontSize: '96px',
    fontWeight: '900',
    color: '#dc2626',
    lineHeight: '1',
    marginBottom: '8px',
    fontFamily: 'monospace',
    letterSpacing: '3px',
    textShadow: '0 2px 12px rgba(220, 38, 38, 0.5)',
  },
  queueBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '16px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  queueDetails: {
    marginTop: '12px',
  },
  serviceNameLarge: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
  },
  counterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#1e293b',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#cbd5e0',
    fontWeight: '500',
  },
  counterIcon: {
    fontSize: '16px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  calledSection: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #334155',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  sectionHeaderSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #334155',
  },
  sectionIconSmall: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  sectionTitleSmall: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  calledContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  calledList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  calledCard: {
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    padding: '16px',
    border: '2px solid #3b82f6',
    textAlign: 'center',
    animation: 'slideInRight 0.4s ease-out',
    transition: 'transform 0.2s ease',
  },
  queueNumberMedium: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#3b82f6',
    lineHeight: '1',
    marginBottom: '8px',
    fontFamily: 'monospace',
  },
  queueInfoSmall: {
    marginTop: '6px',
  },
  serviceNameMedium: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '4px',
  },
  counterInfoSmall: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  waitingSection: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #334155',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  waitingContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  waitingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  waitingCard: {
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #475569',
    textAlign: 'center',
  },
  waitingServiceName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#cbd5e0',
    marginBottom: '10px',
  },
  waitingCount: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#f59e0b',
    lineHeight: '1',
    margin: '6px 0',
  },
  waitingLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '60px',
    gap: '20px',
  },
  emptyIcon: {
    color: '#475569',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '20px',
    color: '#64748b',
    fontWeight: '500',
  },
  emptyStateSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
  },
  emptyTextSmall: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '500',
  },
  bannerContainer: {
    backgroundColor: '#dc2626',
    padding: '16px 0',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #991b1b',
    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    whiteSpace: 'nowrap',
    animation: 'scrollBanner 40s linear infinite',
  },
  bannerLogo: {
    width: '32px',
    height: '32px',
    flexShrink: 0,
  },
  bannerLogoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
  bannerText: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    letterSpacing: '0.3px',
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes scrollBanner {
      0% {
        transform: translateX(100%);
      }
      100% {
        transform: translateX(-100%);
      }
    }
    .serving-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(220, 38, 38, 0.5) !important;
    }
    .called-card:hover {
      transform: translateX(4px);
    }
  `;
  if (!document.head.querySelector('style[data-display-board-animations]')) {
    style.setAttribute('data-display-board-animations', 'true');
    document.head.appendChild(style);
  }
}

