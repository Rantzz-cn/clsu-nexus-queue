import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FiUser, FiLogOut, FiLoader, FiSave, 
  FiSettings, FiBell, FiRefreshCw, FiMonitor,
  FiShield, FiMail, FiPhone
} from 'react-icons/fi';
import apiClient from '../../lib/api';
import { isAuthenticated, getStoredUser, logout } from '../../lib/auth';
import { toast } from '../../components/Toast';

export default function SystemSettings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    queue_number_prefix: '',
    notification_before_minutes: 5,
    auto_refresh_interval: 5,
    display_board_refresh_interval: 5,
    max_queue_per_user: 3,
    enable_sms_notifications: false,
    enable_email_notifications: false,
    system_maintenance_mode: false,
    maintenance_message: '',
  });

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
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/settings');
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/admin/settings', settings);
      if (response.success) {
        toast.success('System settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save system settings');
    } finally {
      setSaving(false);
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
          <p style={styles.loadingText}>Loading settings...</p>
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
              <h1 style={styles.headerTitle}>System Settings</h1>
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
          <button onClick={() => router.push('/admin/dashboard')} style={styles.backButton}>
            <span>Back to Dashboard</span>
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          {/* Queue Settings */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <FiSettings size={24} style={{ marginRight: '12px', color: '#dc2626' }} />
              <h2 style={styles.sectionTitle}>Queue Settings</h2>
            </div>
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Queue Number Prefix
                  <span style={styles.helpText}>
                    (Optional prefix for queue numbers, e.g., "REG" for "REG-001")
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.queue_number_prefix}
                  onChange={(e) => handleInputChange('queue_number_prefix', e.target.value)}
                  placeholder="e.g., REG, LIB, CAS"
                  style={styles.input}
                  maxLength={10}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Maximum Queues Per User
                </label>
                <input
                  type="number"
                  value={settings.max_queue_per_user}
                  onChange={(e) => handleInputChange('max_queue_per_user', parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  style={styles.input}
                />
                <span style={styles.helpText}>
                  Maximum number of active queues a user can have at once
                </span>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <FiBell size={24} style={{ marginRight: '12px', color: '#dc2626' }} />
              <h2 style={styles.sectionTitle}>Notification Settings</h2>
            </div>
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Notification Before Minutes
                </label>
                <input
                  type="number"
                  value={settings.notification_before_minutes}
                  onChange={(e) => handleInputChange('notification_before_minutes', parseInt(e.target.value) || 0)}
                  min="0"
                  max="30"
                  style={styles.input}
                />
                <span style={styles.helpText}>
                  Send notification X minutes before user's turn
                </span>
              </div>

              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.enable_sms_notifications}
                    onChange={(e) => handleInputChange('enable_sms_notifications', e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Enable SMS Notifications</span>
                  <span style={styles.helpText}>(Requires SMS service configuration)</span>
                </label>
              </div>

              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.enable_email_notifications}
                    onChange={(e) => handleInputChange('enable_email_notifications', e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Enable Email Notifications</span>
                  <span style={styles.helpText}>(Requires email service configuration)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Refresh Settings */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <FiRefreshCw size={24} style={{ marginRight: '12px', color: '#dc2626' }} />
              <h2 style={styles.sectionTitle}>Auto-Refresh Settings</h2>
            </div>
            <div style={styles.sectionContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Dashboard Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  value={settings.auto_refresh_interval}
                  onChange={(e) => handleInputChange('auto_refresh_interval', parseInt(e.target.value) || 5)}
                  min="1"
                  max="60"
                  style={styles.input}
                />
                <span style={styles.helpText}>
                  How often the dashboard refreshes data automatically
                </span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Display Board Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  value={settings.display_board_refresh_interval}
                  onChange={(e) => handleInputChange('display_board_refresh_interval', parseInt(e.target.value) || 5)}
                  min="1"
                  max="60"
                  style={styles.input}
                />
                <span style={styles.helpText}>
                  How often the TV display board refreshes queue data
                </span>
              </div>
            </div>
          </div>

          {/* Maintenance Settings */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <FiShield size={24} style={{ marginRight: '12px', color: '#dc2626' }} />
              <h2 style={styles.sectionTitle}>System Maintenance</h2>
            </div>
            <div style={styles.sectionContent}>
              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={settings.system_maintenance_mode}
                    onChange={(e) => handleInputChange('system_maintenance_mode', e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>Enable Maintenance Mode</span>
                  <span style={styles.helpText}>
                    (When enabled, users cannot request new queues)
                  </span>
                </label>
              </div>

              {settings.system_maintenance_mode && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Maintenance Message
                  </label>
                  <textarea
                    value={settings.maintenance_message}
                    onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                    placeholder="Enter maintenance message to display to users..."
                    style={styles.textarea}
                    rows={4}
                  />
                  <span style={styles.helpText}>
                    This message will be shown to users when maintenance mode is active
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div style={styles.actions}>
            <button 
              onClick={handleSave} 
              style={styles.saveButton}
              disabled={saving}
            >
              {saving ? (
                <>
                  <FiLoader className="spin" size={18} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
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
  backButton: {
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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f1f5f9',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  sectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  helpText: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '400',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
  },
  textarea: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'all 0.2s',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '8px',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 32px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

