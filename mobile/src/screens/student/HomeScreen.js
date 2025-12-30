import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getAllServices } from '../../services/services';
import ServiceCard from '../../components/ServiceCard';
import { logout } from '../../services/auth';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import CustomAlert from '../../components/CustomAlert';
import { showError } from '../../utils/errorHandler';
import { Colors } from '../../constants/colors';

/**
 * Home Screen
 * Main screen showing available services
 */
const HomeScreen = ({ navigation }) => {
  const { user, logout: logoutUser } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await getAllServices();
      if (response.success) {
        setServices(response.data || []);
      } else {
        showError(response.error || { message: 'Failed to load services' });
      }
    } catch (error) {
      showError(error, 'Failed to Load Services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    await logout();
    logoutUser();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.userName}>{user?.first_name || 'User'}!</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileButton}>
              <Ionicons name="person" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Services Section */}
      {loading && !refreshing ? (
        <LoadingSpinner message="Loading services..." />
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Available Services</Text>
          <Text style={styles.sectionSubtitle}>Select a service to request a queue</Text>

          {services.length === 0 ? (
            <EmptyState
              iconName="business-outline"
              iconColor={Colors.gray}
              title="No Services Available"
              message="There are no services available at the moment. Please check back later."
            />
          ) : (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => navigation.navigate('Services', { serviceId: service.id })}
              />
            ))
          )}

          {/* Queue History Button */}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('QueueHistory')}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color={Colors.primary} style={styles.historyIcon} />
            <Text style={styles.historyButtonText}>View Queue History</Text>
          </TouchableOpacity>

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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    paddingTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textGray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 8,
    letterSpacing: -1,
    lineHeight: 38,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 28,
    fontWeight: '500',
    lineHeight: 22,
  },
  historyButton: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  historyIcon: {
    marginRight: 10,
  },
  historyButtonText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default HomeScreen;

