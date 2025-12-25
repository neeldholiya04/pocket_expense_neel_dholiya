import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createExpense, updateExpense, reset } from '../store/slices/expenseSlice';
import { COLORS, CATEGORIES, PAYMENT_METHODS } from '../constants';
import { formatLongDate } from '../utils/helpers';

export default function AddExpenseScreen({ navigation, route }) {
  const editingExpense = route.params?.expense;
  const [formData, setFormData] = useState({
    amount: editingExpense?.amount.toString() || '',
    category: editingExpense?.category || '',
    paymentMethod: editingExpense?.paymentMethod || '',
    description: editingExpense?.description || '',
    date: editingExpense ? new Date(editingExpense.date) : new Date()
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector((state) => state.expenses);

  useEffect(() => {
    navigation.setOptions({
      title: editingExpense ? 'Edit Expense' : 'Add Expense'
    });
  }, [editingExpense]);

  useEffect(() => {
    if (isSuccess) {
      Alert.alert('Success', editingExpense ? 'Expense updated' : 'Expense added');
      dispatch(reset());
      navigation.goBack();
    }
    if (isError) {
      Alert.alert('Error', message);
      dispatch(reset());
    }
  }, [isSuccess, isError]);

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Enter valid amount';
    if (!formData.category) newErrors.category = 'Select a category';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Select payment method';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date.toISOString()
      };
      
      if (editingExpense) {
        dispatch(updateExpense({ id: editingExpense._id, data: expenseData }));
      } else {
        dispatch(createExpense(expenseData));
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Amount *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={20} color={COLORS.gray} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={formData.amount}
            onChangeText={(value) => setFormData({ ...formData, amount: value })}
            keyboardType="decimal-pad"
          />
        </View>
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryButton,
                formData.category === cat.value && { backgroundColor: cat.color + '20', borderColor: cat.color }
              ]}
              onPress={() => setFormData({ ...formData, category: cat.value })}
            >
              <Ionicons name={cat.icon} size={24} color={cat.color} />
              <Text style={[styles.categoryText, formData.category === cat.value && { color: cat.color }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

        <Text style={styles.label}>Payment Method *</Text>
        <View style={styles.paymentGrid}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.paymentButton,
                formData.paymentMethod === method.value && styles.paymentButtonActive
              ]}
              onPress={() => setFormData({ ...formData, paymentMethod: method.value })}
            >
              <Ionicons
                name={method.icon}
                size={20}
                color={formData.paymentMethod === method.value ? COLORS.white : COLORS.gray}
              />
              <Text style={[
                styles.paymentText,
                formData.paymentMethod === method.value && styles.paymentTextActive
              ]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.paymentMethod && <Text style={styles.errorText}>{errors.paymentMethod}</Text>}

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
          <Text style={styles.dateText}>{formatLongDate(formData.date)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setFormData({ ...formData, date: selectedDate });
            }}
          />
        )}

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Add a note..."
          value={formData.description}
          onChangeText={(value) => setFormData({ ...formData, description: value })}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>{editingExpense ? 'Update' : 'Add'} Expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: COLORS.border, height: 56 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 18, color: COLORS.dark, fontWeight: '600' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: { width: '30%', padding: 12, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.white },
  categoryText: { fontSize: 11, color: COLORS.gray, marginTop: 4, textAlign: 'center' },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, gap: 6 },
  paymentButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  paymentText: { fontSize: 12, color: COLORS.gray },
  paymentTextActive: { color: COLORS.white },
  dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  dateText: { fontSize: 16, color: COLORS.dark },
  textArea: { backgroundColor: COLORS.white, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, textAlignVertical: 'top', minHeight: 80 },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  submitButtonText: { color: COLORS.white, fontSize: 18, fontWeight: '600' },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 5 }
});
