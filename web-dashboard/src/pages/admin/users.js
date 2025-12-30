import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  FiUser, FiLogOut, FiLoader, FiEdit2, FiSearch,
  FiX, FiCheck, FiUsers, FiShield, FiMail, FiPhone
} from 'react-icons/fi';
import { MdPerson, MdBusinessCenter, MdSchool } from 'react-icons/md';
import apiClient from '../../lib/api';
import { isAuthenticated, getStoredUser, logout } from '../../lib/auth';
import { toast } from '../../components/Toast';

export default function UserManagement() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [formData, setFormData] = useState({
    role: 'student',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 20;

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
    loadUsers();
  }, [router, currentPage, roleFilter]);

  useEffect(() => {
    // Filter users based on search term
    let filtered = users;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.first_name?.toLowerCase().includes(searchLower) ||
        u.last_name?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.student_id?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      params.append('page', currentPage);
      params.append('limit', usersPerPage);

      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      if (response.success) {
        setUsers(response.data.users || []);
        setFilteredUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(error.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      role: userToEdit.role || 'student',
      is_active: userToEdit.is_active !== undefined ? userToEdit.is_active : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.role || formData.role === '') {
      toast.error('User role is required');
      return;
    }
    
    setSubmitting(true);

    try {
      const response = await apiClient.put(`/admin/users/${editingUser.id}`, formData);
      if (response.success) {
        await loadUsers();
        setShowModal(false);
        toast.success('User updated successfully');
      } else {
        toast.error(response.error?.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.error?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FiShield size={20} color="#dc2626" />;
      case 'counter_staff':
        return <MdBusinessCenter size={20} color="#3b82f6" />;
      default:
        return <MdSchool size={20} color="#10b981" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
      case 'counter_staff':
        return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
      default:
        return { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' };
    }
  };

  if (typeof window === 'undefined' || loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <FiLoader style={styles.spinner} className="spin" />
          <p style={styles.loadingText}>Loading users...</p>
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
              <h1 style={styles.headerTitle}>User Management</h1>
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
          <div style={styles.searchBar}>
            <FiSearch size={20} color="#64748b" style={{ marginRight: '12px' }} />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterButtons}>
            <button
              onClick={() => setRoleFilter('')}
              style={{
                ...styles.filterButton,
                ...(roleFilter === '' ? styles.filterButtonActive : {})
              }}
            >
              All Users
            </button>
            <button
              onClick={() => setRoleFilter('student')}
              style={{
                ...styles.filterButton,
                ...(roleFilter === 'student' ? styles.filterButtonActive : {})
              }}
            >
              Students
            </button>
            <button
              onClick={() => setRoleFilter('counter_staff')}
              style={{
                ...styles.filterButton,
                ...(roleFilter === 'counter_staff' ? styles.filterButtonActive : {})
              }}
            >
              Counter Staff
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              style={{
                ...styles.filterButton,
                ...(roleFilter === 'admin' ? styles.filterButtonActive : {})
              }}
            >
              Administrators
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>
              Users ({filteredUsers.length})
            </h2>
          </div>
          {filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <FiUsers size={64} color="#cbd5e0" />
              <h3 style={styles.emptyTitle}>No Users Found</h3>
              <p style={styles.emptyMessage}>
                {searchTerm ? 'Try adjusting your search terms.' : 'No users match the current filters.'}
              </p>
            </div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeaderCell}>User</th>
                      <th style={styles.tableHeaderCell}>Email</th>
                      <th style={styles.tableHeaderCell}>Student ID</th>
                      <th style={styles.tableHeaderCell}>Role</th>
                      <th style={styles.tableHeaderCell}>Status</th>
                      <th style={styles.tableHeaderCell}>Joined</th>
                      <th style={styles.tableHeaderCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userItem, index) => {
                      const roleColors = getRoleBadgeColor(userItem.role);
                      return (
                        <tr key={userItem.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                          <td style={styles.tableCell}>
                            <div style={styles.userCell}>
                              <div style={styles.userAvatar}>
                                {getRoleIcon(userItem.role)}
                              </div>
                              <div>
                                <div style={styles.userNameCell}>
                                  {userItem.first_name} {userItem.last_name}
                                </div>
                                {userItem.phone_number && (
                                  <div style={styles.userPhone}>
                                    <FiPhone size={12} /> {userItem.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.emailCell}>
                              <FiMail size={14} color="#64748b" style={{ marginRight: '6px' }} />
                              {userItem.email}
                            </div>
                          </td>
                          <td style={styles.tableCell}>{userItem.student_id || '-'}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.roleBadge,
                              backgroundColor: roleColors.bg,
                              color: roleColors.text,
                              borderColor: roleColors.border,
                            }}>
                              {userItem.role === 'counter_staff' ? 'Counter Staff' : 
                               userItem.role === 'admin' ? 'Admin' : 'Student'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: userItem.is_active ? '#d1fae5' : '#f1f5f9',
                              color: userItem.is_active ? '#065f46' : '#64748b',
                            }}>
                              {userItem.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {userItem.created_at 
                              ? new Date(userItem.created_at).toLocaleDateString()
                              : '-'}
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              onClick={() => handleEdit(userItem)}
                              style={styles.editButton}
                              title="Edit user"
                            >
                              <FiEdit2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === 1 ? styles.paginationButtonDisabled : {})
                    }}
                  >
                    Previous
                  </button>
                  <span style={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === totalPages ? styles.paginationButtonDisabled : {})
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {showModal && editingUser && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit User</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeButton}>
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.userInfoSection}>
                <div style={styles.userInfoCard}>
                  <div style={styles.userInfoRow}>
                    <span style={styles.userInfoLabel}>Name:</span>
                    <span style={styles.userInfoValue}>
                      {editingUser.first_name} {editingUser.last_name}
                    </span>
                  </div>
                  <div style={styles.userInfoRow}>
                    <span style={styles.userInfoLabel}>Email:</span>
                    <span style={styles.userInfoValue}>{editingUser.email}</span>
                  </div>
                  {editingUser.student_id && (
                    <div style={styles.userInfoRow}>
                      <span style={styles.userInfoLabel}>Student ID:</span>
                      <span style={styles.userInfoValue}>{editingUser.student_id}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={styles.select}
                  required
                >
                  <option value="student">Student</option>
                  <option value="counter_staff">Counter Staff</option>
                  <option value="admin">Administrator</option>
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
                  <span>Active User</span>
                </label>
                <p style={styles.helpText}>
                  Inactive users cannot log in to the system.
                </p>
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
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    backgroundColor: 'transparent',
    color: '#1e293b',
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: '#dc2626',
    color: 'white',
    borderColor: '#dc2626',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
  },
  tableHeader: {
    marginBottom: '20px',
  },
  tableTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0',
  },
  tableRow: {
    backgroundColor: 'white',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#475569',
    borderBottom: '1px solid #f1f5f9',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNameCell: {
    fontWeight: '600',
    color: '#1e293b',
  },
  userPhone: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  emailCell: {
    display: 'flex',
    alignItems: 'center',
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  editButton: {
    padding: '8px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
  },
  paginationButton: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  emptyState: {
    padding: '80px 40px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '24px 0 12px 0',
  },
  emptyMessage: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
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
  userInfoSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
  },
  userInfoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
  },
  userInfoValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
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
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    backgroundColor: 'white',
    boxSizing: 'border-box',
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
  helpText: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '8px',
    marginLeft: '28px',
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

