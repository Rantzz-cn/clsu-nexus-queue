import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../services/auth';
import CustomAlert from '../../components/CustomAlert';
import { Colors } from '../../constants/colors';

/**
 * Profile Screen
 * Shows user profile and logout option
 */
const ProfileScreen = ({ navigation }) => {
  const { user, logout: logoutUser } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    await logout();
    logoutUser();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="id-card-outline" size={20} color={Colors.gray} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Student ID</Text>
            </View>
            <Text style={styles.detailValue}>{user?.student_id}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="call-outline" size={20} color={Colors.gray} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Phone Number</Text>
            </View>
            <Text style={styles.detailValue}>
              {user?.phone_number || 'Not provided'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.gray} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Email</Text>
            </View>
            <Text style={styles.detailValue}>{user?.email}</Text>
          </View>

          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.gray} style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Role</Text>
            </View>
            <Text style={styles.detailValue}>
              {user?.role === 'student' ? 'Student' : user?.role}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={22} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <CustomAlert
        visible={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        type="warning"
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowLogoutConfirm(false),
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: handleLogoutConfirm,
          },
        ]}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 36,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  avatarText: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.white,
  },
  userName: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 10,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  userEmail: {
    fontSize: 17,
    color: Colors.textGray,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 14,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark,
    maxWidth: '60%',
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: Colors.danger,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: Colors.danger,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ProfileScreen;

