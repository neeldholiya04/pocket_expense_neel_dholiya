import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { deleteExpense } from '../store/slices/expenseSlice';
import { COLORS, CATEGORIES, PAYMENT_METHODS } from '../constants';
import { formatCurrency, formatLongDate, getCategoryColor } from '../utils/helpers';

export default function ExpenseDetailsScreen({ navigation, route }) {
  const { expense } = route.params;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat ? cat.icon : 'ellipsis-horizontal';
  };

  const getPaymentIcon = (method) => {
    const payment = PAYMENT_METHODS.find((p) => p.value === method);
    return payment ? payment.icon : 'card';
  };

  const handleEdit = () => {
    navigation.navigate('AddExpense', { expense });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteExpense(expense._id));
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.amountCard, { backgroundColor: getCategoryColor(expense.category) }]}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getCategoryIcon(expense.category)} 
            size={48} 
            color={COLORS.white} 
          />
        </View>
        <Text style={styles.amount}>{formatCurrency(expense.amount, user?.currency)}</Text>
        <Text style={styles.category}>{expense.category}</Text>
        {!expense.synced && (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline" size={16} color={COLORS.white} />
            <Text style={styles.offlineText}>Not synced</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Date</Text>
          </View>
          <Text style={styles.detailValue}>{formatLongDate(expense.date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name={getPaymentIcon(expense.paymentMethod)} size={20} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Payment Method</Text>
          </View>
          <Text style={styles.detailValue}>{expense.paymentMethod}</Text>
        </View>

        {expense.description && (
          <View style={[styles.detailRow, styles.descriptionRow]}>
            <View style={styles.detailLeft}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.gray} />
              <Text style={styles.detailLabel}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{expense.description}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <Ionicons name="time-outline" size={20} color={COLORS.gray} />
            <Text style={styles.detailLabel}>Created</Text>
          </View>
          <Text style={styles.detailValue}>
            {new Date(expense.createdAt).toLocaleString()}
          </Text>
        </View>

        {expense.updatedAt && expense.updatedAt !== expense.createdAt && (
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="refresh-outline" size={20} color={COLORS.gray} />
              <Text style={styles.detailLabel}>Last Updated</Text>
            </View>
            <Text style={styles.detailValue}>
              {new Date(expense.updatedAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="pencil" size={20} color={COLORS.white} />
          <Text style={styles.editButtonText}>Edit Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color={COLORS.danger} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  amountCard: {
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8
  },
  category: {
    fontSize: 20,
    color: COLORS.white,
    opacity: 0.9
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 15,
    gap: 6
  },
  offlineText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600'
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 15
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  descriptionRow: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500'
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.dark,
    marginTop: 8,
    lineHeight: 20
  },
  actions: {
    padding: 20,
    gap: 12
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600'
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.danger,
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600'
  }
});
