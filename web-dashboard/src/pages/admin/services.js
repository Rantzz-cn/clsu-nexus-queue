import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FiUser, FiLogOut, FiLoader, FiPlus, FiEdit2, FiTrash2, 
  FiX, FiCheck, FiClock, FiMapPin, FiSettings
} from 'react-icons/fi';
import { MdBusiness } from 'react-icons/md';
import apiClient from '../../lib/api';
import { isAuthenticated, getStoredUser, logout } from '../../lib/auth';
import { toast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function ServiceManagement() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    estimated_service_time: 5,
    max_queue_size: 100,
    operating_hours_start: '',
    operating_hours_end: '',
    queue_prefix: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);

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
  }, [router]);

  const loadServices = async () => {
    try {
      const response = await apiClient.get('/admin/services');
      if (response.success) {
        // Filter out inactive services (deleted services) - only show active ones
        const activeServices = response.data.filter(service => service.is_active === true);
        setServices(activeServices);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error(error.error?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      estimated_service_time: 5,
      max_queue_size: 100,
      operating_hours_start: '',
      operating_hours_end: '',
      queue_prefix: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      location: service.location || '',
      estimated_service_time: service.estimated_service_time || 5,
      max_queue_size: service.max_queue_size || 100,
      operating_hours_start: service.operating_hours_start || '',
      operating_hours_end: service.operating_hours_end || '',
      is_active: service.is_active !== undefined ? service.is_active : true,
    });
    setShowModal(true);
  };

  const handleDelete = (serviceId) => {
    setDeletingServiceId(serviceId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingServiceId) return;

    setShowDeleteConfirm(false);
    try {
      const response = await apiClient.delete(`/admin/services/${deletingServiceId}`);
      if (response.success) {
        // Reload services to refresh the list (will filter out the deleted service)
        await loadServices();
        toast.success('Service deleted successfully');
      } else {
        toast.error(response.error?.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.error?.message || 'Failed to delete service');
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Service name is required');
      return;
    }
    if (!formData.location || formData.location.trim() === '') {
      toast.error('Service location is required');
      return;
    }
    if (!formData.estimated_service_time || parseInt(formData.estimated_service_time) <= 0) {
      toast.error('Estimated service time must be greater than 0');
      return;
    }
    if (!formData.max_queue_size || parseInt(formData.max_queue_size) <= 0) {
      toast.error('Max queue size must be greater than 0');
      return;
    }
    if (formData.operating_hours_start && formData.operating_hours_end) {
      if (formData.operating_hours_start >= formData.operating_hours_end) {
        toast.error('Operating hours end time must be after start time');
        return;
      }
    }
    
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        estimated_service_time: parseInt(formData.estimated_service_time),
        max_queue_size: parseInt(formData.max_queue_size),
        operating_hours_start: formData.operating_hours_start || null,
        operating_hours_end: formData.operating_hours_end || null,
      };

      if (editingService) {
        const response = await apiClient.put(`/admin/services/${editingService.id}`, data);
        if (response.success) {
          await loadServices();
          setShowModal(false);
          toast.success('Service updated successfully');
        } else {
          toast.error(response.error?.message || 'Failed to update service');
        }
      } else {
        const response = await apiClient.post('/admin/services', data);
        if (response.success) {
          await loadServices();
          setShowModal(false);
          toast.success('Service created successfully');
        } else {
          toast.error(response.error?.message || 'Failed to create service');
        }
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.error?.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
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
          <p style={styles.loadingText}>Loading services...</p>
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
              <h1 style={styles.headerTitle}>Service Management</h1>
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
            <h2 style={styles.sectionTitle}>Services</h2>
            <p style={styles.sectionSubtitle}>Manage all services and their settings</p>
          </div>
          <button onClick={handleCreate} style={styles.addButton}>
            <FiPlus size={20} />
            <span>Add Service</span>
          </button>
        </div>

        {services.length === 0 ? (
          <div style={styles.emptyState}>
            <MdBusiness size={64} color="#cbd5e0" />
            <h3 style={styles.emptyTitle}>No Services Found</h3>
            <p style={styles.emptyMessage}>Get started by creating your first service.</p>
            <button onClick={handleCreate} style={styles.emptyButton}>
              <FiPlus size={18} />
              <span>Create Service</span>
            </button>
          </div>
        ) : (
          <div style={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} style={styles.serviceCard}>
                <div style={styles.serviceCardHeader}>
                  <div style={styles.serviceIcon}>
                    <MdBusiness size={32} color={service.is_active ? '#dc2626' : '#94a3b8'} />
                  </div>
                  <div style={styles.serviceInfo}>
                    <h3 style={styles.serviceName}>{service.name}</h3>
                    <div style={styles.serviceStatus}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: service.is_active ? '#d1fae5' : '#f1f5f9',
                        color: service.is_active ? '#065f46' : '#64748b',
                      }}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {service.description && (
                  <p style={styles.serviceDescription}>{service.description}</p>
                )}
                
                <div style={styles.serviceDetails}>
                  {service.location && (
                    <div style={styles.detailRow}>
                      <FiMapPin size={16} color="#64748b" />
                      <span>{service.location}</span>
                    </div>
                  )}
                  <div style={styles.detailRow}>
                    <FiClock size={16} color="#64748b" />
                    <span>{service.estimated_service_time} min avg. service time</span>
                  </div>
                  <div style={styles.detailRow}>
                    <FiSettings size={16} color="#64748b" />
                    <span>Max queue: {service.max_queue_size}</span>
                  </div>
                </div>

                <div style={styles.serviceActions}>
                  <button onClick={() => handleEdit(service)} style={styles.editButton}>
                    <FiEdit2 size={18} />
                    <span>Edit</span>
                  </button>
                  <button onClick={() => handleDelete(service.id)} style={styles.deleteButton}>
                    <FiTrash2 size={18} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingService ? 'Edit Service' : 'Create New Service'}
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.closeButton}>
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={styles.textarea}
                  rows={3}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Queue Number Prefix
                  <span style={styles.helpText}>
                    (Optional: Custom prefix for queue numbers, e.g., "REG", "CLI", "MEC". If empty, uses first 3 letters of service name)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.queue_prefix}
                  onChange={(e) => setFormData({...formData, queue_prefix: e.target.value.toUpperCase()})}
                  style={styles.input}
                  placeholder="e.g., REG, CLI, MEC"
                  maxLength={10}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estimated Service Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.estimated_service_time}
                    onChange={(e) => setFormData({...formData, estimated_service_time: e.target.value})}
                    style={styles.input}
                    min="1"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Queue Size</label>
                  <input
                    type="number"
                    value={formData.max_queue_size}
                    onChange={(e) => setFormData({...formData, max_queue_size: e.target.value})}
                    style={styles.input}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Operating Hours Start</label>
                  <input
                    type="time"
                    value={formData.operating_hours_start}
                    onChange={(e) => setFormData({...formData, operating_hours_start: e.target.value})}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Operating Hours End</label>
                  <input
                    type="time"
                    value={formData.operating_hours_end}
                    onChange={(e) => setFormData({...formData, operating_hours_end: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    style={styles.checkbox}
                  />
                  <span>Active Service</span>
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
                      <span>{editingService ? 'Update' : 'Create'} Service</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingServiceId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        message="Are you sure you want to delete this service? This will deactivate it."
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
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
  },
  serviceCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px',
  },
  serviceIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
    letterSpacing: '-0.3px',
  },
  serviceStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 16px 0',
    lineHeight: '1.6',
  },
  serviceDetails: {
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
  serviceActions: {
    display: 'flex',
    gap: '10px',
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
    maxWidth: '600px',
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  helpText: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '400',
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
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
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

