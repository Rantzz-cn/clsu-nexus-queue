import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getServiceById, getServiceQueueStatus } from '../../services/services';
import { requestQueue } from '../../services/queue';
import { connectSocket, joinServiceRoom } from '../../services/socket';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import CustomAlert from '../../components/CustomAlert';
import { showError } from '../../utils/errorHandler';
import { Colors } from '../../constants/colors';
import { toast } from '../../components/Toast';

/**
 * Services Screen
 * Shows service details and allows requesting a queue
 */
const ServicesScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showRequestConfirm, setShowRequestConfirm] = useState(false);

  useEffect(() => {
    loadServiceData();
    connectSocket();
    joinServiceRoom(serviceId);
    
    return () => {
      // Cleanup if needed
    };
  }, [serviceId]);

  const loadServiceData = async () => {
    try {
      const [serviceResponse, statusResponse] = await Promise.all([
        getServiceById(serviceId),
        getServiceQueueStatus(serviceId),
      ]);

      if (serviceResponse.success) {
        setService(serviceResponse.data);
      } else {
        showError(serviceResponse.error || { message: 'Failed to load service' });
      }

      if (statusResponse.success) {
        setQueueStatus(statusResponse.data);
      }
    } catch (error) {
      showError(error, 'Failed to Load Service');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQueue = () => {
    setShowRequestConfirm(true);
  };

  const handleRequestConfirm = async () => {
    setShowRequestConfirm(false);
    setRequesting(true);
    try {
      const response = await requestQueue(serviceId);
      if (response.success) {
        toast.success(`Queue Number: ${response.data.queueNumber}`);
        // Navigate to queue status after a short delay
        setTimeout(() => {
          navigation.navigate('QueueStatus', {
            queueId: response.data.id,
          });
        }, 1000);
      } else {
        showError(response.error || { message: 'Failed to request queue' });
      }
    } catch (error) {
      showError(error, 'Failed to Request Queue');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading service details..." />;
  }

  if (!service) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          iconName="close-circle-outline"
          iconColor={Colors.danger}
          title="Service Not Found"
          message="The service you're looking for doesn't exist or may have been removed."
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          {service.description && (
            <Text style={styles.description}>{service.description}</Text>
          )}
          {service.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={18} color={Colors.gray} style={styles.locationIcon} />
              <Text style={styles.location}>{service.location}</Text>
            </View>
          )}
        </View>

        {/* Queue Status */}
        {queueStatus && (
          <View style={styles.queueStatusCard}>
            <Text style={styles.statusTitle}>Current Queue Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Waiting</Text>
                <Text style={styles.statusValue}>{queueStatus.waitingCount}</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Current Serving</Text>
                <Text style={styles.statusValue}>
                  {queueStatus.currentServing || 'None'}
                </Text>
              </View>
            </View>
            {queueStatus.averageWaitTime && (
              <Text style={styles.waitTime}>
                Average wait time: {queueStatus.averageWaitTime} minutes
              </Text>
            )}
          </View>
        )}

        {/* Counters */}
        {service.counters && service.counters.length > 0 && (
          <View style={styles.countersSection}>
            <Text style={styles.sectionTitle}>Counters</Text>
            {service.counters.map((counter) => (
              <View key={counter.id} style={styles.counterCard}>
                <Text style={styles.counterName}>{counter.name}</Text>
                <Text style={styles.counterStatus}>
                  Status: {counter.status}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Request Queue Button */}
        <TouchableOpacity
          style={[styles.requestButton, requesting && styles.buttonDisabled]}
          onPress={handleRequestQueue}
          disabled={requesting}
          activeOpacity={0.8}
        >
          {requesting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="ticket-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.requestButtonText}>Request Queue Number</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Request Queue Confirmation Modal */}
      <CustomAlert
        visible={showRequestConfirm}
        title="Request Queue"
        message={`Request a queue number for ${service?.name}?`}
        type="info"
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowRequestConfirm(false),
          },
          {
            text: 'Request',
            onPress: handleRequestConfirm,
          },
        ]}
        onClose={() => setShowRequestConfirm(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  content: {
    padding: 20,
  },
  serviceInfo: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
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
  serviceName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.dark,
    marginBottom: 14,
    letterSpacing: -1,
    lineHeight: 38,
  },
  description: {
    fontSize: 17,
    color: Colors.textGray,
    marginBottom: 20,
    lineHeight: 26,
    fontWeight: '400',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationIcon: {
    marginRight: 8,
  },
  location: {
    fontSize: 15,
    color: Colors.textGray,
    fontWeight: '500',
  },
  queueStatusCard: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
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
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: Colors.textGray,
    marginBottom: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusValue: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 42,
  },
  waitTime: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    fontWeight: '400',
  },
  countersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 16,
  },
  counterCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  counterName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  counterStatus: {
    fontSize: 15,
    color: Colors.textGray,
    fontWeight: '500',
  },
  requestButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ServicesScreen;

