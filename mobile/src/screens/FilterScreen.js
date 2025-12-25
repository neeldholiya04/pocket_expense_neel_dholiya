import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, CATEGORIES, PAYMENT_METHODS } from '../constants';
import { formatDate } from '../utils/helpers';

export default function FilterScreen({ navigation, route }) {
  const { onApplyFilters } = route.params || {};
  
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    categories: [],
    paymentMethods: [],
    minAmount: null,
    maxAmount: null
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const toggleCategory = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const togglePaymentMethod = (method) => {
    setFilters(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    navigation.goBack();
  };

  const handleReset = () => {
    setFilters({
      startDate: null,
      endDate: null,
      categories: [],
      paymentMethods: [],
      minAmount: null,
      maxAmount: null
    });
  };

  const activeFilterCount = 
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    filters.categories.length +
    filters.paymentMethods.length +
    (filters.minAmount ? 1 : 0) +
    (filters.maxAmount ? 1 : 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
            <Text style={styles.dateLabel}>From:</Text>
            <Text style={styles.dateValue}>
              {filters.startDate ? formatDate(filters.startDate) : 'Select date'}
            </Text>
            {filters.startDate && (
              <TouchableOpacity onPress={() => setFilters({ ...filters, startDate: null })}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
            <Text style={styles.dateLabel}>To:</Text>
            <Text style={styles.dateValue}>
              {filters.endDate ? formatDate(filters.endDate) : 'Select date'}
            </Text>
            {filters.endDate && (
              <TouchableOpacity onPress={() => setFilters({ ...filters, endDate: null })}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showStartDatePicker && (
            <DateTimePicker
              value={filters.startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setFilters({ ...filters, startDate: selectedDate });
                }
              }}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={filters.endDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setFilters({ ...filters, endDate: selectedDate });
                }
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.chip,
                  filters.categories.includes(category.value) && {
                    backgroundColor: category.color + '20',
                    borderColor: category.color
                  }
                ]}
                onPress={() => toggleCategory(category.value)}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={filters.categories.includes(category.value) ? category.color : COLORS.gray}
                />
                <Text
                  style={[
                    styles.chipText,
                    filters.categories.includes(category.value) && { color: category.color }
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.chipContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.chip,
                  filters.paymentMethods.includes(method.value) && styles.chipActive
                ]}
                onPress={() => togglePaymentMethod(method.value)}
              >
                <Ionicons
                  name={method.icon}
                  size={16}
                  color={filters.paymentMethods.includes(method.value) ? COLORS.white : COLORS.gray}
                />
                <Text
                  style={[
                    styles.chipText,
                    filters.paymentMethods.includes(method.value) && styles.chipTextActive
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.filterInfo}>
          <Text style={styles.filterCount}>
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    flex: 1
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500'
  },
  dateValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  chipText: {
    fontSize: 13,
    color: COLORS.gray
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '500'
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  filterInfo: {
    marginBottom: 12
  },
  filterCount: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center'
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark
  },
  applyButton: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center'
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white
  }
});
