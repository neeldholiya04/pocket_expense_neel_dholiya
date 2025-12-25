import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: COLORS.primary,
          color: COLORS.white
        };
      case 'secondary':
        return {
          backgroundColor: COLORS.light,
          color: COLORS.dark,
          borderWidth: 1,
          borderColor: COLORS.border
        };
      case 'danger':
        return {
          backgroundColor: COLORS.danger,
          color: COLORS.white
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: COLORS.primary,
          borderWidth: 1,
          borderColor: COLORS.primary
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          color: COLORS.white
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: 12, fontSize: 14 };
      case 'medium':
        return { height: 48, paddingHorizontal: 20, fontSize: 16 };
      case 'large':
        return { height: 56, paddingHorizontal: 24, fontSize: 18 };
      default:
        return { height: 48, paddingHorizontal: 20, fontSize: 16 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: disabled ? 0.5 : 1
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.color} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={sizeStyles.fontSize + 2}
              color={variantStyles.color}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.color,
                fontSize: sizeStyles.fontSize
              },
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8
  },
  icon: {
    marginRight: -4
  },
  text: {
    fontWeight: '600'
  }
});
