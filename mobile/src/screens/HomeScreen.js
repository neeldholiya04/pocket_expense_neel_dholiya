import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { getExpenses, deleteExpense, syncOfflineExpenses, reset } from '../store/slices/expenseSlice';
import { COLORS, CATEGORIES } from '../constants';
import { formatCurrency, formatDate, getCurrentMonthRange, getTodayRange } from '../utils/helpers';

export default function HomeScreen({ navigation }) {
  const [view, setView] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const { expenses, isLoading } = useSelector((state) => state.expenses);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadExpenses();

    dispatch(syncOfflineExpenses());
  }, [view]);

  const loadExpenses = () => {
    const params = view === 'daily' ? getTodayRange() : getCurrentMonthRange();
    dispatch(getExpenses(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(syncOfflineExpenses());
    loadExpenses();
    setRefreshing(false);
  };

  const handleDelete = (id, amount) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete this ${formatCurrency(amount, user?.currency)} expense?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteExpense(id));
          }
        }
      ]
    );
  };

  const getCategoryIcon = (category) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat ? cat.icon : 'ellipsis-horizontal';
  };

  const getCategoryColor = (category) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat ? cat.color : COLORS.gray;
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const offlineCount = expenses.filter(e => !e.synced).length;

  const renderExpense = ({ item }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => navigation.navigate('ExpenseDetails', { expense: item })}
      onLongPress={() => handleDelete(item._id, item.amount)}
    >
      <View style={styles.expenseLeft}>
        <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <Ionicons name={getCategoryIcon(item.category)} size={24} color={getCategoryColor(item.category)} />
        </View>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          {item.description && <Text style={styles.expenseDescription}>{item.description}</Text>}
        </View>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount, user?.currency)}</Text>
        <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
        {!item.synced && (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline" size={12} color={COLORS.warning} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color={COLORS.gray} />
      <Text style={styles.emptyText}>No expenses yet</Text>
      <Text style={styles.emptySubtext}>
        {view === 'daily' ? "You haven't added any expenses today" : 'Start tracking your expenses'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.headerSubtitle}>Track your expenses</Text>
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={() => dispatch(syncOfflineExpenses())}
        >
          <Ionicons name="sync" size={24} color={COLORS.primary} />
          {offlineCount > 0 && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>{offlineCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>{view === 'daily' ? 'Today' : 'This Month'}</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, view === 'daily' && styles.viewButtonActive]}
              onPress={() => setView('daily')}
            >
              <Text style={[styles.viewButtonText, view === 'daily' && styles.viewButtonTextActive]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, view === 'monthly' && styles.viewButtonActive]}
              onPress={() => setView('monthly')}
            >
              <Text style={[styles.viewButtonText, view === 'monthly' && styles.viewButtonTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.totalAmount}>{formatCurrency(totalExpenses, user?.currency)}</Text>
        <Text style={styles.expenseCount}>{expenses.length} expenses</Text>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={EmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2
  },
  syncButton: {
    position: 'relative',
    padding: 8
  },
  syncBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  syncBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold'
  },
  statsCard: {
    backgroundColor: COLORS.primary,
    margin: 20,
    padding: 20,
    borderRadius: 16
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  statsTitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 2
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  viewButtonActive: {
    backgroundColor: COLORS.white
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600'
  },
  viewButtonTextActive: {
    color: COLORS.primary
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5
  },
  expenseCount: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9
  },
  list: {
    padding: 20,
    paddingTop: 0
  },
  expenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  expenseDetails: {
    flex: 1
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2
  },
  expenseDate: {
    fontSize: 12,
    color: COLORS.gray
  },
  expenseDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
    fontStyle: 'italic'
  },
  expenseRight: {
    alignItems: 'flex-end',
    position: 'relative'
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 2
  },
  paymentMethod: {
    fontSize: 11,
    color: COLORS.gray
  },
  offlineBadge: {
    position: 'absolute',
    top: -5,
    right: -5
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 20
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  }
});
