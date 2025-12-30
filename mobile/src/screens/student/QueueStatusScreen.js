import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getQueueStatus, cancelQueue } from '../../services/queue';
import {
  connectSocket,
  joinUserRoom,
  onQueueCalled,
  onQueueUpdate,
  offQueueCalled,
  offQueueUpdate,
} from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { notifyQueueCalled, notifyQueueCompleted } from '../../services/notifications';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import CustomAlert from '../../components/CustomAlert';
import { showError } from '../../utils/errorHandler';
import { Colors } from '../../constants/colors';
import { toast } from '../../components/Toast';

/**
 * Queue Status Screen
 * Shows real-time queue status and updates
 */
const QueueStatusScreen = ({ route, navigation }) => {
  const { queueId } = route.params;
  const { user } = useAuth();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadQueueStatus();
    connectSocket();
    
    if (user?.id) {
      joinUserRoom(user.id);
    }

    // Subscribe to WebSocket events
    const handleQueueUpdate = (data) => {
      if (data.queueNumber === queue?.queueNumber) {
        loadQueueStatus();
      }
    };

    const handleQueueCalled = async (data) => {
      // Check if this is a completion notification
      if (data.type === 'queue_completed') {
        // Show push notification
        await notifyQueueCompleted(data.queueNumber);
        
        // Show toast notification
        toast.success(data.message || `Thank you for waiting! Your service for queue ${data.queueNumber} has been completed.`);
      } else if (data.counterNumber) {
        // Queue called notification
        // Show push notification
        await notifyQueueCalled(data.queueNumber, data.counterNumber, data.counterName);
        
        // Show toast notification
        toast.success(`Your queue ${data.queueNumber} has been called to Counter ${data.counterNumber}! Please proceed to the counter.`);
      } else {
        // Fallback for other notifications
        toast.info(data.message || `Update for queue ${data.queueNumber}`);
      }
      loadQueueStatus();
    };

    onQueueUpdate(handleQueueUpdate);
    onQueueCalled(handleQueueCalled);

    return () => {
      offQueueUpdate(handleQueueUpdate);
      offQueueCalled(handleQueueCalled);
    };
  }, [queueId, user?.id, queue?.queueNumber]);

  const loadQueueStatus = async () => {
    try {
      const response = await getQueueStatus(queueId);
      if (response.success) {
        setQueue(response.data);
      }
    } catch (error) {
      showError(error, 'Failed to Load Queue Status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadQueueStatus();
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    setShowCancelConfirm(false);
    try {
      const response = await cancelQueue(queueId);
      if (response.success) {
        toast.success('Queue cancelled successfully');
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } else {
        showError(response.error || { message: 'Failed to cancel queue' });
      }
    } catch (error) {
      showError(error, 'Failed to Cancel Queue');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return '#ffc107';
      case 'called':
        return '#17a2b8';
      case 'serving':
        return '#28a745';
      case 'completed':
        return '#6c757d';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return <LoadingSpinner message="Loading queue status..." />;
  }

  if (!queue) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          iconName="close-circle-outline"
          iconColor={Colors.danger}
          title="Queue Not Found"
          message="The queue you're looking for doesn't exist or may have been removed."
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Queue Number Card */}
        <View style={styles.queueCard}>
          <Text style={styles.queueLabel}>Queue Number</Text>
          <Text style={styles.queueNumber}>{queue.queueNumber}</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.cardLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(queue.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(queue.status)}
            </Text>
          </View>
        </View>

        {/* Queue Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Queue Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>{queue.serviceName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Position:</Text>
            <Text style={styles.detailValue}>{queue.queuePosition}</Text>
          </View>

          {queue.estimatedWaitTime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Wait:</Text>
              <Text style={styles.detailValue}>
                {queue.estimatedWaitTime} minutes
              </Text>
            </View>
          )}

          {queue.requestedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Requested At:</Text>
              <Text style={styles.detailValue}>
                {new Date(queue.requestedAt).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Cancel Button */}
        {queue.status === 'waiting' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={22} color="#fff" style={styles.cancelIcon} />
            <Text style={styles.cancelButtonText}>Cancel Queue</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cancel Queue Confirmation Modal */}
      <CustomAlert
        visible={showCancelConfirm}
        title="Cancel Queue"
        message="Are you sure you want to cancel this queue?"
        type="warning"
        buttons={[
          {
            text: 'No',
            style: 'cancel',
            onPress: () => setShowCancelConfirm(false),
          },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: handleCancelConfirm,
          },
        ]}
        onClose={() => setShowCancelConfirm(false)}
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
  queueCard: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  queueLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.95,
  },
  queueNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 4,
    lineHeight: 80,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 13,
    color: Colors.textGray,
    marginBottom: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
  },
  statusText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailLabel: {
    fontSize: 15,
    color: Colors.textGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
  },
  cancelButton: {
    backgroundColor: Colors.danger,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: Colors.danger,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  cancelIcon: {
    marginRight: 12,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default QueueStatusScreen;

