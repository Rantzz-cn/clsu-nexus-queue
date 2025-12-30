import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';

/**
 * Logo Component
 * Reusable logo component for QTech branding
 * 
 * Usage:
 * <Logo size="large" />  // 88x88px
 * <Logo size="medium" /> // 80x80px
 * <Logo size="small" />  // 64x64px
 */
const Logo = ({ size = 'large', style, showBackground = true }) => {
  const sizeMap = {
    large: 88,
    medium: 80,
    small: 64,
  };

  const logoSize = sizeMap[size] || 88;

  // Try to load the logo, fallback to a placeholder if not found
  let logoSource;
  try {
    // If logo.png exists, use it; otherwise fallback to a placeholder
    logoSource = require('../../assets/logo.png');
  } catch (error) {
    // Logo not found, return null (you'll see the icon placeholder)
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: logoSize,
          height: logoSize,
          borderRadius: logoSize / 2,
        },
        showBackground && styles.withBackground,
        style,
      ]}
    >
      <Image
        source={logoSource}
        style={[
          styles.logo,
          {
            width: logoSize * 0.7,
            height: logoSize * 0.7,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  withBackground: {
    backgroundColor: '#fff5f5',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    // Logo will be scaled to 70% of container size
  },
});

export default Logo;

