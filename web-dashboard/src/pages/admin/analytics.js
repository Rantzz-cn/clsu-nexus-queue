import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FiBarChart2, FiTrendingUp, FiClock, FiCheckCircle, 
  FiUser, FiLogOut, FiLoader, FiCalendar, FiFilter,
  FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { MdQueue, MdAccessTime, MdBusiness } from 'react-icons/md';
import apiClient from '../../lib/api';
import { isAuthenticated, getStoredUser, logout } from '../../lib/auth';
import { toast } from '../../components/Toast';

export default function Analytics() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedService, setSelectedService] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
    loadServices();
    
    // Set default to last 30 days on initial load
    const today = new Date();
    const last30 = new Date(today);
    last30.setDate(today.getDate() - 30);
    setDateRange({
      startDate: last30.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    });
    setSelectedPeriod('last30days');
  }, [router]);

  useEffect(() => {
    // Load analytics when filters are ready
    if (user) {
      loadAnalytics();
    }
  }, [dateRange.startDate, dateRange.endDate, selectedService]);

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

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (selectedService) params.append('serviceId', selectedService);

      const response = await apiClient.get(`/admin/analytics?${params.toString()}`);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error(error.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
    setSelectedPeriod('custom');
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        startDate = endDate;
        break;
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'last30days':
        const last30 = new Date(today);
        last30.setDate(today.getDate() - 30);
        startDate = last30.toISOString().split('T')[0];
        break;
      case 'last7days':
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 7);
        startDate = last7.toISOString().split('T')[0];
        break;
      default:
        startDate = '';
        endDate = '';
    }

    setDateRange({ startDate, endDate });
  };

  const handleFilter = () => {
    loadAnalytics();
  };

  const handleReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    setSelectedService('');
    setSelectedPeriod('last30days');
    setTimeout(() => loadAnalytics(), 100);
  };

  const exportToCSV = () => {
    if (!analytics) return;

    let csv = 'Analytics Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    if (dateRange.startDate) csv += `Date Range: ${dateRange.startDate} to ${dateRange.endDate || 'Today'}\n`;
    csv += '\n';

    // Overall Statistics
    csv += 'Overall Statistics\n';
    csv += `Total Queues,${analytics.totalQueues}\n`;
    csv += `Completed Queues,${analytics.completedQueues}\n`;
    csv += `Cancelled Queues,${analytics.cancelledQueues}\n`;
    csv += `Average Wait Time (minutes),${analytics.averageWaitTime || 'N/A'}\n`;
    csv += `Average Service Time (minutes),${analytics.averageServiceTime || 'N/A'}\n`;
    csv += '\n';

    // Peak Hours
    if (analytics.peakHours && analytics.peakHours.length > 0) {
      csv += 'Peak Hours\n';
      csv += 'Hour,Queue Count\n';
      analytics.peakHours.forEach(item => {
        const hourLabel = item.hour === 0 ? '12 AM' : 
                         item.hour < 12 ? `${item.hour} AM` : 
                         item.hour === 12 ? '12 PM' : 
                         `${item.hour - 12} PM`;
        csv += `${hourLabel},${item.queueCount}\n`;
      });
      csv += '\n';
    }

    // Service Statistics
    if (analytics.serviceStatistics && analytics.serviceStatistics.length > 0) {
      csv += 'Service Performance\n';
      csv += 'Service,Total Queues,Completed,Average Wait Time (min),Average Queues Per Day\n';
      analytics.serviceStatistics.forEach(service => {
        csv += `${service.serviceName},${service.totalQueues},${service.completedQueues},${service.averageWaitTime || 'N/A'},${service.averageQueuesPerDay.toFixed(1)}\n`;
      });
    }

    // Create download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Calculate max for bar charts
  const getMaxCount = (data) => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item.queueCount || item.totalQueues || 0), 1);
  };

  if (typeof window === 'undefined' || loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <FiLoader style={styles.spinner} className="spin" />
          <p style={styles.loadingText}>Loading analytics...</p>
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
              <h1 style={styles.headerTitle}>Analytics & Reports</h1>
              <p style={styles.headerSubtitle}>QTech Management System</p>
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => router.push('/admin/dashboard')} style={styles.backButton}>
            Dashboard
          </button>
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
        {/* Filters */}
        <div style={styles.filtersSection}>
          <div style={styles.filtersHeader}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <FiFilter size={20} style={{ marginRight: '8px' }} />
              <h2 style={styles.filtersTitle}>Filters</h2>
            </div>
            <button onClick={exportToCSV} style={styles.exportButton} disabled={!analytics}>
              <FiDownload size={18} />
              <span>Export CSV</span>
            </button>
          </div>
          
          {/* Time Period Presets */}
          <div style={styles.periodPresets}>
            <label style={styles.filterLabel}>Quick Select:</label>
            <div style={styles.presetButtons}>
              <button
                onClick={() => handlePeriodChange('today')}
                style={{
                  ...styles.presetButton,
                  ...(selectedPeriod === 'today' ? styles.presetButtonActive : {})
                }}
              >
                Today
              </button>
              <button
                onClick={() => handlePeriodChange('last7days')}
                style={{
                  ...styles.presetButton,
                  ...(selectedPeriod === 'last7days' ? styles.presetButtonActive : {})
                }}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handlePeriodChange('thisWeek')}
                style={{
                  ...styles.presetButton,
                  ...(selectedPeriod === 'thisWeek' ? styles.presetButtonActive : {})
                }}
              >
                This Week
              </button>
              <button
                onClick={() => handlePeriodChange('thisMonth')}
                style={{
                  ...styles.presetButton,
                  ...(selectedPeriod === 'thisMonth' ? styles.presetButtonActive : {})
                }}
              >
                This Month
              </button>
              <button
                onClick={() => handlePeriodChange('last30days')}
                style={{
                  ...styles.presetButton,
                  ...(selectedPeriod === 'last30days' ? styles.presetButtonActive : {})
                }}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                style={styles.filterInput}
              />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                style={styles.filterInput}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Service</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.filterActions}>
              <button onClick={handleFilter} style={styles.filterButton}>
                <FiRefreshCw size={18} />
                <span>Apply Filters</span>
              </button>
              <button onClick={handleReset} style={styles.resetButton}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Overall Statistics */}
            <div style={styles.statsSection}>
              <div style={styles.sectionHeader}>
                <FiBarChart2 size={24} style={{ marginRight: '12px' }} />
                <h2 style={styles.sectionTitle}>Overall Statistics</h2>
              </div>
              <div style={styles.statsGrid}>
                <div style={{...styles.statCard, ...styles.statPrimary}}>
                  <div style={styles.statIconWrapper}>
                    <MdQueue size={40} color="#dc2626" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>{analytics.totalQueues}</span>
                    <span style={styles.statLabel}>Total Queues</span>
                  </div>
                </div>
                <div style={{...styles.statCard, ...styles.statSuccess}}>
                  <div style={styles.statIconWrapper}>
                    <FiCheckCircle size={40} color="#10b981" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>{analytics.completedQueues}</span>
                    <span style={styles.statLabel}>Completed</span>
                  </div>
                </div>
                <div style={{...styles.statCard, ...styles.statWarning}}>
                  <div style={styles.statIconWrapper}>
                    <FiClock size={40} color="#f59e0b" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>
                      {analytics.averageWaitTime ? `${analytics.averageWaitTime} min` : 'N/A'}
                    </span>
                    <span style={styles.statLabel}>Avg Wait Time</span>
                  </div>
                </div>
                <div style={{...styles.statCard, ...styles.statInfo}}>
                  <div style={styles.statIconWrapper}>
                    <MdAccessTime size={40} color="#3b82f6" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>
                      {analytics.averageServiceTime ? `${analytics.averageServiceTime} min` : 'N/A'}
                    </span>
                    <span style={styles.statLabel}>Avg Service Time</span>
                  </div>
                </div>
                <div style={{...styles.statCard, ...styles.statDanger}}>
                  <div style={styles.statIconWrapper}>
                    <FiTrendingUp size={40} color="#ef4444" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>{analytics.cancelledQueues}</span>
                    <span style={styles.statLabel}>Cancelled</span>
                  </div>
                </div>
                <div style={{...styles.statCard, ...styles.statSuccess}}>
                  <div style={styles.statIconWrapper}>
                    <FiCheckCircle size={40} color="#10b981" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statValue}>
                      {analytics.totalQueues > 0 
                        ? `${Math.round((analytics.completedQueues / analytics.totalQueues) * 100)}%`
                        : '0%'}
                    </span>
                    <span style={styles.statLabel}>Completion Rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Peak Hours */}
            {analytics.peakHours && analytics.peakHours.length > 0 && (
              <div style={styles.chartSection}>
                <div style={styles.sectionHeader}>
                  <FiTrendingUp size={24} style={{ marginRight: '12px' }} />
                  <h2 style={styles.sectionTitle}>Peak Hours</h2>
                </div>
                <div style={styles.chartCard}>
                  <div style={styles.barChartContainer}>
                    {analytics.peakHours.map((item, index) => {
                      const maxCount = getMaxCount(analytics.peakHours);
                      const percentage = (item.queueCount / maxCount) * 100;
                      const hourLabel = item.hour === 0 ? '12 AM' : 
                                       item.hour < 12 ? `${item.hour} AM` : 
                                       item.hour === 12 ? '12 PM' : 
                                       `${item.hour - 12} PM`;
                      return (
                        <div key={index} style={styles.barChartItem}>
                          <div style={styles.barChartBar}>
                            <div 
                              style={{
                                ...styles.barChartFill,
                                height: `${percentage}%`,
                                backgroundColor: `hsl(${210 - index * 20}, 70%, 50%)`,
                              }}
                            />
                          </div>
                          <div style={styles.barChartLabel}>
                            <span style={styles.barChartHour}>{hourLabel}</span>
                            <span style={styles.barChartCount}>{item.queueCount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Service Statistics */}
            {analytics.serviceStatistics && analytics.serviceStatistics.length > 0 && (
              <div style={styles.tableSection}>
                <div style={styles.sectionHeader}>
                  <MdBusiness size={24} style={{ marginRight: '12px' }} />
                  <h2 style={styles.sectionTitle}>Service Performance</h2>
                </div>
                <div style={styles.tableCard}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Service</th>
                        <th style={styles.tableHeader}>Total Queues</th>
                        <th style={styles.tableHeader}>Completed</th>
                        <th style={styles.tableHeader}>Avg Wait Time</th>
                        <th style={styles.tableHeader}>Avg/Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.serviceStatistics.map((service, index) => (
                        <tr key={service.serviceId} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                          <td style={styles.tableCell}>{service.serviceName}</td>
                          <td style={styles.tableCell}>{service.totalQueues}</td>
                          <td style={styles.tableCell}>{service.completedQueues}</td>
                          <td style={styles.tableCell}>
                            {service.averageWaitTime ? `${service.averageWaitTime} min` : 'N/A'}
                          </td>
                          <td style={styles.tableCell}>{service.averageQueuesPerDay.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
    gap: '16px',
  },
  backButton: {
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
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  filtersHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  periodPresets: {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  presetButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '12px',
  },
  presetButton: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  presetButtonActive: {
    backgroundColor: '#dc2626',
    color: 'white',
    borderColor: '#dc2626',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filtersTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    alignItems: 'end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  filterInput: {
    padding: '10px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
  },
  filterSelect: {
    padding: '10px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  filterActions: {
    display: 'flex',
    gap: '10px',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  resetButton: {
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statsSection: {
    marginBottom: '32px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  statPrimary: {
    borderLeft: '4px solid #dc2626',
  },
  statSuccess: {
    borderLeft: '4px solid #10b981',
  },
  statWarning: {
    borderLeft: '4px solid #f59e0b',
  },
  statInfo: {
    borderLeft: '4px solid #3b82f6',
  },
  statDanger: {
    borderLeft: '4px solid #ef4444',
  },
  statIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1.2',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
    marginTop: '4px',
  },
  chartSection: {
    marginBottom: '32px',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  barChartContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: '16px',
    height: '300px',
    padding: '20px 0',
  },
  barChartItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  barChartBar: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
  },
  barChartFill: {
    width: '100%',
    minHeight: '4px',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.3s ease',
  },
  barChartLabel: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  barChartHour: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
  },
  barChartCount: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
  },
  tableSection: {
    marginBottom: '32px',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    borderBottom: '2px solid #e2e8f0',
  },
  tableRow: {
    backgroundColor: 'white',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#475569',
    borderBottom: '1px solid #f1f5f9',
  },
};

