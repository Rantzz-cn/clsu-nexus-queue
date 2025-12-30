import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FiUser, FiLogOut, FiLoader, FiPlus, FiEdit2, FiTrash2, 
  FiX, FiCheck, FiSettings, FiUsers
} from 'react-icons/fi';
import { MdBusiness, MdLocationOn } from 'react-icons/md';
import apiClient from '../../lib/api';
import { isAuthenticated, getStoredUser, logout } from '../../lib/auth';
import { toast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function CounterManagement() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [counters, setCounters] = useState([]);
  const [services, setServices] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingCounter, setEditingCounter] = useState(null);
  const [assigningCounter, setAssigningCounter] = useState(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [formData, setFormData] = useState({
    service_id: '',
    counter_number: '',
    name: '',
    status: 'closed',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCounterId, setDeletingCounterId] = useState(null);

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
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [countersResponse, servicesResponse, usersResponse] = await Promise.all([
        apiClient.get('/admin/counters'),
        apiClient.get('/admin/services'),
        apiClient.get('/admin/users?role=counter_staff'),
      ]);
      
      if (countersResponse.success) {
        // Filter out inactive counters (deleted counters) - only show active ones
        const activeCounters = countersResponse.data.filter(counter => counter.is_active === true);
        setCounters(activeCounters);
      }
      if (servicesResponse.success) {
        setServices(servicesResponse.data.filter(s => s.is_active));
      }
      if (usersResponse.success) {
        setStaffUsers(usersResponse.data.users || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(error.error?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCounter(null);
    setFormData({
      service_id: '',
      counter_number: '',
      name: '',
      status: 'closed',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (counter) => {
    setEditingCounter(counter);
    setFormData({
      service_id: counter.service_id || '',
      counter_number: counter.counter_number || '',
      name: counter.name || '',
      status: counter.status || 'closed',
      is_active: counter.is_active !== undefined ? counter.is_active : true,
    });
    setShowModal(true);
  };

  const handleDelete = (counterId) => {
    setDeletingCounterId(counterId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCounterId) return;

    setShowDeleteConfirm(false);
    try {
      const response = await apiClient.delete(`/admin/counters/${deletingCounterId}`);
      if (response.success) {
        // Reload data to refresh the list (will filter out deleted counter)
        await loadData();
        toast.success('Counter deleted successfully');
      } else {
        toast.error(response.error?.message || 'Failed to delete counter');
      }
    } catch (error) {
      console.error('Error deleting counter:', error);
      toast.error(error.error?.message || 'Failed to delete counter');
    } finally {
      setDeletingCounterId(null);
    }
  };

  const handleAssignStaff = async (counter) => {
    setAssigningCounter(counter);
    try {
      // Load current staff assignments
      const response = await apiClient.get(`/admin/counters/${counter.id}/staff`);
      if (response.success) {
        setSelectedStaffIds(response.data.map(s => s.user_id));
      }
    } catch (error) {
      console.error('Error loading counter staff:', error);
      setSelectedStaffIds([]);
    }
    setShowAssignModal(true);
  };

  const handleSaveStaffAssignment = async () => {
    if (!assigningCounter || selectedStaffIds.length === 0) {
      toast.warning('Please select at least one staff member');
      return;
    }

    try {
      const response = await apiClient.post(`/admin/counters/${assigningCounter.id}/assign-staff`, {
        user_ids: selectedStaffIds,
      });
      if (response.success) {
        toast.success('Counter assigned to staff successfully');
        setShowAssignModal(false);
        setAssigningCounter(null);
        setSelectedStaffIds([]);
      } else {
        toast.error(response.error?.message || 'Failed to assign staff to counter');
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error(error.error?.message || 'Failed to assign staff to counter');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.service_id || formData.service_id === '') {
      toast.error('Please select a service');
      return;
    }
    if (!formData.counter_number || formData.counter_number.trim() === '') {
      toast.error('Counter number is required');
      return;
    }
    if (!formData.status || formData.status === '') {
      toast.error('Counter status is required');
      return;
    }
    
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        service_id: parseInt(formData.service_id),
      };

      if (editingCounter) {
        const response = await apiClient.put(`/admin/counters/${editingCounter.id}`, data);
        if (response.success) {
          await loadData();
          setShowModal(false);
          toast.success('Counter updated successfully');
        } else {
          toast.error(response.error?.message || 'Failed to update counter');
        }
      } else {
        const response = await apiClient.post('/admin/counters', data);
        if (response.success) {
          await loadData();
          setShowModal(false);
          toast.success('Counter created successfully');
        } else {
          toast.error(response.error?.message || 'Failed to create counter');
        }
      }
    } catch (error) {
      console.error('Error saving counter:', error);
      toast.error(error.error?.message || 'Failed to save counter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      open: { bg: '#d1fae5', text: '#065f46' },
      busy: { bg: '#fef3c7', text: '#92400e' },
      closed: { bg: '#fee2e2', text: '#991b1b' },
      break: { bg: '#f3f4f6', text: '#374151' },
    };
    return colors[status] || colors.closed;
  };

  if (typeof window === 'undefined' || loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <FiLoader style={styles.spinner} className="spin" />
          <p style={styles.loadingText}>Loading counters...</p>
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
              <img src="/logo.png" alt="QTech Logo" style={styles.logoImage} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Counter Management</h1>
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
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Counters</h2>
            <p style={styles.sectionSubtitle}>Manage all counters and their assignments</p>
          </div>
          <button onClick={handleCreate} style={styles.addButton}>
            <FiPlus size={20} />
            <span>Add Counter</span>
          </button>
        </div>

        {counters.length === 0 ? (
          <div style={styles.emptyState}>
            <MdLocationOn size={64} color="#cbd5e0" />
            <h3 style={styles.emptyTitle}>No Counters Found</h3>
            <p style={styles.emptyMessage}>Get started by creating your first counter.</p>
            <button onClick={handleCreate} style={styles.emptyButton}>
              <FiPlus size={18} />
              <span>Create Counter</span>
            </button>
          </div>
        ) : (
          <div style={styles.countersGrid}>
            {counters.map((counter) => {
              const statusColors = getStatusColor(counter.status);
              return (
                <div key={counter.id} style={styles.counterCard}>
                  <div style={styles.counterCardHeader}>
                    <div style={styles.counterInfo}>
                      <h3 style={styles.counterName}>
                        {counter.name || `Counter ${counter.counter_number}`}
                      </h3>
                      <div style={styles.counterMeta}>
                        <MdBusiness size={16} color="#64748b" />
                        <span>{counter.service_name}</span>
                      </div>
                    </div>
                    <div style={styles.counterBadges}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                      }}>
                        {counter.status.toUpperCase()}
                      </span>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: counter.is_active ? '#d1fae5' : '#f1f5f9',
                        color: counter.is_active ? '#065f46' : '#64748b',
                      }}>
                        {counter.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.counterDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Counter Number:</span>
                      <span style={styles.detailValue}>{counter.counter_number}</span>
                    </div>
                    {counter.service_location && (
                      <div style={styles.detailRow}>
                        <MdLocationOn size={16} color="#64748b" />
                        <span>{counter.service_location}</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.counterActions}>
                    <button onClick={() => handleAssignStaff(counter)} style={styles.assignButton}>
                      <FiUsers size={18} />
                      <span>Assign Staff</span>
                    </button>
                    <button onClick={() => handleEdit(counter)} style={styles.editButton}>
                      <FiEdit2 size={18} />
                      <span>Edit</span>
                    </button>
                    <button onClick={() => handleDelete(counter.id)} style={styles.deleteButton}>
                      <FiTrash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingCounter ? 'Edit Counter' : 'Create New Counter'}
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.closeButton}>
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Service *</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({...formData, service_id: e.target.value})}
                  style={styles.select}
                  required
                  disabled={editingCounter !== null}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Counter Number *</label>
                <input
                  type="text"
                  value={formData.counter_number}
                  onChange={(e) => setFormData({...formData, counter_number: e.target.value})}
                  style={styles.input}
                  placeholder="e.g., 1, 2, A, B"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Counter Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  placeholder="Optional: e.g., Counter 1, Window A"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={styles.select}
                  required
                >
                  <option value="closed">Closed</option>
                  <option value="open">Open</option>
                  <option value="busy">Busy</option>
                  <option value="break">Break</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <span>Active Counter</span>
                </label>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelButton}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FiLoader size={18} className="spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={18} />
                      <span>{editingCounter ? 'Update' : 'Create'} Counter</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && assigningCounter && (
        <div style={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Assign Staff to {assigningCounter.name || `Counter ${assigningCounter.counter_number}`}
              </h2>
              <button onClick={() => setShowAssignModal(false)} style={styles.closeButton}>
                <FiX size={24} />
              </button>
            </div>

            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Staff Members *</label>
                <div style={styles.checkboxList}>
                  {staffUsers.map((staff) => (
                    <label key={staff.id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedStaffIds.includes(staff.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStaffIds([...selectedStaffIds, staff.id]);
                          } else {
                            setSelectedStaffIds(selectedStaffIds.filter(id => id !== staff.id));
                          }
                        }}
                        style={styles.checkbox}
                      />
                      <span>
                        {staff.first_name} {staff.last_name} ({staff.email})
                      </span>
                    </label>
                  ))}
                </div>
                {staffUsers.length === 0 && (
                  <p style={styles.noStaffMessage}>No counter staff users found. Please create counter staff users first.</p>
                )}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssigningCounter(null);
                    setSelectedStaffIds([]);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStaffAssignment}
                  style={styles.submitButton}
                  disabled={selectedStaffIds.length === 0}
                >
                  <FiCheck size={18} />
                  <span>Assign Staff</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingCounterId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Counter"
        message="Are you sure you want to delete this counter? This will deactivate it."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

// Styles - matching admin dashboard theme
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  sectionSubtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
  },
  countersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  counterCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
  },
  counterCardHeader: {
    marginBottom: '16px',
  },
  counterInfo: {
    marginBottom: '12px',
  },
  counterName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
    letterSpacing: '-0.3px',
  },
  counterMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
  },
  counterBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  counterDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#475569',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#64748b',
  },
  detailValue: {
    color: '#1e293b',
  },
  counterActions: {
    display: 'flex',
    gap: '10px',
  },
  assignButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  editButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '80px 40px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '24px 0 12px 0',
  },
  emptyMessage: {
    fontSize: '16px',
    color: '#64748b',
    margin: '0 0 32px 0',
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    color: '#1e293b',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
  },
  noStaffMessage: {
    color: '#64748b',
    fontSize: '14px',
    fontStyle: 'italic',
    marginTop: '12px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
  },
  cancelButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
  },
};

