import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FiBarChart2, FiClipboard, FiClock, FiCheckCircle, 
  FiTrendingUp, FiUser, FiLogOut, FiLoader, FiDatabase,
  FiSettings, FiList
} from 'react-icons/fi';
import { MdQueue, MdAccessTime, MdBusiness } from 'react-icons/md';
import apiClient from '../../lib/api';
import { isAuthenticated, getStoredUser, logout } from '../../lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const currentUser = getStoredUser();
    if (currentUser?.role !== 'admin') {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    loadDashboard();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  const loadDashboard = async () => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (typeof window === 'undefined' || loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <FiLoader style={styles.spinner} className="spin" />
          <p style={styles.loadingText}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoSection}>
            <div style={styles.logo}>
              <img 
                src="/logo.png" 
                alt="QTech Logo" 
                style={styles.logoImage}
              />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Admin Dashboard</h1>
              <p style={styles.headerSubtitle}>QTech Management System</p>
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userIcon}>
              <FiUser size={20} />
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.first_name} {user?.last_name}</span>
              <span style={styles.userRole}>Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <button 
            onClick={() => router.push('/admin/services')} 
            style={styles.actionButton}
          >
            <FiSettings size={24} />
            <div style={styles.actionContent}>
              <span style={styles.actionTitle}>Manage Services</span>
              <span style={styles.actionSubtitle}>Add, edit, or remove services</span>
            </div>
          </button>
          <button 
            onClick={() => router.push('/admin/counters')} 
            style={styles.actionButton}
          >
            <FiList size={24} />
            <div style={styles.actionContent}>
              <span style={styles.actionTitle}>Manage Counters</span>
              <span style={styles.actionSubtitle}>Add, edit, or remove counters</span>
            </div>
          </button>
          <button 
            onClick={() => router.push('/admin/analytics')} 
            style={styles.actionButton}
          >
            <FiBarChart2 size={24} />
            <div style={styles.actionContent}>
              <span style={styles.actionTitle}>Analytics & Reports</span>
              <span style={styles.actionSubtitle}>View statistics and reports</span>
            </div>
          </button>
          <button 
            onClick={() => router.push('/admin/users')} 
            style={styles.actionButton}
          >
            <FiUser size={24} />
            <div style={styles.actionContent}>
              <span style={styles.actionTitle}>Manage Users</span>
              <span style={styles.actionSubtitle}>View and manage all users</span>
            </div>
          </button>
          <button 
            onClick={() => router.push('/admin/queues')} 
            style={styles.actionButton}
          >
            <MdQueue size={24} />
            <div style={styles.actionContent}>
              <span style={styles.actionTitle}>Queue Management</span>
              <span style={styles.actionSubtitle}>View and manage all queues</span>
            </div>
          </button>
          <button 
            onClick={() => router.push('/admin/display-board')} 
            style={styles.actionButton}
          >
            <FiDatabase size={24} />
            <div style={styles.actionContent}>
              <span style={styles.actionTitle}>Display Board</span>
              <span style={styles.actionSubtitle}>TV projection for queue numbers</span>
            </div>
          </button>
          <button 
            onClick={() => router.push('/admin/settings')} 
            style={styles.actionButton}
          >
            <FiSettings size={24} />
            <div style={styles.actionContent}>
              <span style={styles.actionTitle}>System Settings</span>
              <span style={styles.actionSubtitle}>Configure system preferences</span>
            </div>
          </button>
        </div>

        {stats && (
          <>
            {/* Overview Statistics */}
            <div style={styles.statsSection}>
              <div style={styles.sectionHeader}>
                <FiBarChart2 size={24} style={{ marginRight: '12px' }} />
                <h2 style={styles.sectionTitle}>Today's Overview</h2>
              </div>
              <div style={styles.statsGrid}>
                <div style={{...styles.statCard, ...styles.statPrimary}}>
                  <div style={styles.statIconWrapper}>
                    <MdQueue size={40} color="#dc2626" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>{stats.totalQueuesToday}</span>
                    <span style={styles.statLabel}>Total Queues Today</span>
                    <span style={styles.statTrend}>All time queues</span>
                  </div>
                </div>
                <div style={{...styles.statCard, ...styles.statWarning}}>
                  <div style={styles.statIconWrapper}>
                    <FiClock size={40} color="#f59e0b" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>{stats.activeQueues}</span>
                    <span style={styles.statLabel}>Active Queues</span>
                    <span style={styles.statTrend}>Currently processing</span>
                  </div>
                </div>
                <div style={{...styles.statCard, ...styles.statSuccess}}>
                  <div style={styles.statIconWrapper}>
                    <FiCheckCircle size={40} color="#10b981" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>{stats.completedQueuesToday}</span>
                    <span style={styles.statLabel}>Completed Today</span>
                    <span style={styles.statTrend}>Successfully served</span>
                  </div>
                </div>
                <div style={{...styles.statCard, ...styles.statInfo}}>
                  <div style={styles.statIconWrapper}>
                    <MdAccessTime size={40} color="#dc2626" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>
                      {stats.averageWaitTime ? `${stats.averageWaitTime}` : 'N/A'}
                    </span>
                    <span style={styles.statLabel}>Avg Wait Time</span>
                    <span style={styles.statTrend}>
                      {stats.averageWaitTime ? 'minutes' : 'No data available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Statistics */}
            <div style={styles.servicesSection}>
              <div style={styles.sectionHeader}>
                <FiTrendingUp size={24} style={{ marginRight: '12px' }} />
                <h2 style={styles.sectionTitle}>Service Performance</h2>
                <span style={styles.sectionSubtitle}>
                  Detailed statistics for each service
                </span>
              </div>
              {stats.services.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIconWrapper}>
                    <MdBusiness size={96} color="#cbd5e0" />
                  </div>
                  <h3 style={styles.emptyTitle}>No Service Data Available</h3>
                  <p style={styles.emptyMessage}>
                    Service statistics will appear here once services start receiving queues.
                  </p>
                </div>
              ) : (
                <div style={styles.servicesGrid}>
                  {stats.services.map((service) => (
                    <div key={service.serviceId} style={styles.serviceCard}>
                      <div style={styles.serviceCardHeader}>
                        <div style={styles.serviceIconWrapper}>
                          <MdBusiness size={32} color="#dc2626" />
                        </div>
                        <h3 style={styles.serviceName}>{service.serviceName}</h3>
                      </div>
                      <div style={styles.serviceStats}>
                        <div style={styles.serviceStatItem}>
                          <div style={styles.serviceStatHeader}>
                            <FiClipboard size={18} color="#64748b" />
                            <span style={styles.serviceStatLabel}>Queues Today</span>
                          </div>
                          <span style={styles.serviceStatValue}>{service.queuesToday}</span>
                        </div>
                        <div style={styles.serviceStatItem}>
                          <div style={styles.serviceStatHeader}>
                            <FiCheckCircle size={18} color="#10b981" />
                            <span style={styles.serviceStatLabel}>Completed</span>
                          </div>
                          <span style={{...styles.serviceStatValue, color: '#10b981'}}>
                            {service.completedToday}
                          </span>
                        </div>
                        {service.averageWaitTime && (
                          <div style={styles.serviceStatItem}>
                            <div style={styles.serviceStatHeader}>
                              <MdAccessTime size={18} color="#dc2626" />
                              <span style={styles.serviceStatLabel}>Avg Wait Time</span>
                            </div>
                            <span style={{...styles.serviceStatValue, color: '#dc2626'}}>
                              {service.averageWaitTime} min
                            </span>
                          </div>
                        )}
                        <div style={styles.serviceStatItem}>
                          <div style={styles.serviceStatHeader}>
                            <FiDatabase size={18} color="#8b5cf6" />
                            <span style={styles.serviceStatLabel}>Completion Rate</span>
                          </div>
                          <span style={{...styles.serviceStatValue, color: '#8b5cf6'}}>
                            {service.queuesToday > 0 
                              ? Math.round((service.completedToday / service.queuesToday) * 100)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
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
    color: '#64748b',
    fontSize: '16px',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: '-0.5px',
  },
  headerSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '400',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.4',
  },
  userRole: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '48px',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  actionContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px',
  },
  actionSubtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  statsSection: {
    marginBottom: '48px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  sectionSubtitle: {
    marginLeft: 'auto',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
    borderLeft: '4px solid',
  },
  statPrimary: {
    borderLeftColor: '#dc2626',
  },
  statWarning: {
    borderLeftColor: '#f59e0b',
  },
  statSuccess: {
    borderLeftColor: '#10b981',
  },
  statInfo: {
    borderLeftColor: '#dc2626',
  },
  statIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    flexShrink: 0,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  statValue: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: '1.2',
    letterSpacing: '-1px',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '15px',
    color: '#475569',
    fontWeight: '600',
    marginBottom: '4px',
  },
  statTrend: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '400',
  },
  servicesSection: {
    marginTop: '48px',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
  },
  serviceCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f1f5f9',
  },
  serviceIconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  serviceStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  serviceStatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceStatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  serviceStatLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  serviceStatValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '80px 40px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  emptyIconWrapper: {
    marginBottom: '32px',
    display: 'inline-block',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 16px 0',
  },
  emptyMessage: {
    fontSize: '16px',
    color: '#64748b',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
};
