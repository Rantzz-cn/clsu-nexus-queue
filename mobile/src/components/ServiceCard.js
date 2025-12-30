import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

/**
 * Service Card Component
 * Displays service information in a card format
 */
const ServiceCard = ({ service, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>{service.name}</Text>
        </View>
        {service.description && (
          <Text style={styles.description} numberOfLines={2}>
            {service.description}
          </Text>
        )}
        {service.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={Colors.textGray} style={styles.locationIcon} />
            <Text style={styles.location}>{service.location}</Text>
          </View>
        )}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    padding: 24,
    paddingRight: 56,
  },
  cardHeader: {
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    color: Colors.textGray,
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIcon: {
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: Colors.textGray,
    fontWeight: '500',
  },
  arrowContainer: {
    position: 'absolute',
    right: 24,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceCard;

