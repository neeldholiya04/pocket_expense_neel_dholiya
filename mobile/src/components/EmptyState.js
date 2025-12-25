import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

export default function EmptyState({ 
  icon = 'folder-open-outline',
  title = 'No data found',
  message = 'Get started by adding your first item',
  style
}) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={80} color={COLORS.gray} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center'
  },
  message: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20
  }
});
