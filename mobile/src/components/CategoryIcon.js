import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants';

export default function CategoryIcon({ category, size = 48, style }) {
  const getCategoryData = (cat) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found || { icon: 'ellipsis-horizontal', color: '#C7CEEA' };
  };

  const categoryData = getCategoryData(category);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: categoryData.color + '20'
        },
        style
      ]}
    >
      <Ionicons
        name={categoryData.icon}
        size={size * 0.5}
        color={categoryData.color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
