import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { getCategoryBreakdown, getInsights } from '../store/slices/expenseSlice';
import api from '../services/api';
import { COLORS } from '../constants';
import { formatCurrency, getCategoryColor as getColor, getCurrentMonthRange } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;
const STORAGE_KEY_SELECTED_TAB = 'analytics_selected_tab';

export default function AnalyticsScreen() {
  const dispatch = useDispatch();
  const { categoryBreakdown, insights, isLoadingCategoryBreakdown, isLoadingInsights } = useSelector((state) => state.expenses);
  const { user } = useSelector((state) => state.auth);
  const expensesVersion = useSelector((state) => state.expenses.expensesVersion);
  const [selectedTab, setSelectedTab] = useState('Monthly');
  const [monthlyCategoryData, setMonthlyCategoryData] = useState(null);
  const [monthlyCategoryLoading, setMonthlyCategoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    dispatch(getCategoryBreakdown({}));
    dispatch(getInsights());
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY_SELECTED_TAB);
        if (v) setSelectedTab(v);
      } catch (e) {
        console.warn('[Analytics] failed to load selected tab', e?.message || e);
      }
    })();
  }, [dispatch]);

  const reload = async () => {
    setRefreshing(true);
    try {
      const p1 = dispatch(getCategoryBreakdown({}));
      const p2 = dispatch(getInsights());

      const refreshMonthly = (async () => {
        setMonthlyCategoryLoading(true);
        try {
          const params = getCurrentMonthRange();
          const res = await api.get('/expenses/analytics/category-breakdown', { params });
          setMonthlyCategoryData(res.data?.data || null);
        } catch (e) {
          console.warn('[Analytics] failed to fetch monthly category breakdown on reload', e?.message || e);
          setMonthlyCategoryData(null);
        } finally {
          setMonthlyCategoryLoading(false);
        }
      })();

      await Promise.all([p1, p2, refreshMonthly]);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_SELECTED_TAB, selectedTab);
      } catch (e) {

      }
    })();
  }, [selectedTab]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    reload();
  }, [expensesVersion]);

  useEffect(() => {
    console.log('AnalyticsScreen - categoryBreakdown:', categoryBreakdown);
    console.log('AnalyticsScreen - insights:', insights);
    console.log('AnalyticsScreen - isLoadingCategoryBreakdown:', isLoadingCategoryBreakdown);
    console.log('AnalyticsScreen - isLoadingInsights:', isLoadingInsights);
  }, [categoryBreakdown, insights, isLoadingCategoryBreakdown, isLoadingInsights]);

  useEffect(() => {
    (async () => {
      setMonthlyCategoryLoading(true);
      try {
        const params = getCurrentMonthRange();
        const res = await api.get('/expenses/analytics/category-breakdown', { params });
        setMonthlyCategoryData(res.data?.data || null);
      } catch (e) {
        console.warn('[Analytics] failed to fetch monthly category breakdown', e?.message || e);
        setMonthlyCategoryData(null);
      } finally {
        setMonthlyCategoryLoading(false);
      }
    })();
  }, []);

  const chartData = categoryBreakdown?.breakdown?.map((item, index) => ({
    name: item.category,
    population: item.amount,
    color: getColor(item.category),
    legendFontColor: COLORS.dark,
    legendFontSize: 12
  })) || [];

  const monthlyBudget = insights?.monthlyBudget || 0;
  const currentMonthTotal = insights?.currentMonthTotal || 0;
  const percentUsed = monthlyBudget > 0 ? Math.round((currentMonthTotal / monthlyBudget) * 100) : 0;
  const budgetColor = percentUsed >= 90 ? COLORS.danger : percentUsed >= 75 ? COLORS.warning : COLORS.success;

  const monthlyCategoryPie = monthlyCategoryData?.breakdown?.map(item => ({
    name: item.category,
    population: item.amount,
    color: getColor(item.category),
    legendFontColor: COLORS.dark,
    legendFontSize: 12
  })) || [];

  return (
    <ScrollView
      style={styles.container}
      stickyHeaderIndices={[1]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Spending Analytics</Text>
          <Text style={styles.headerSubtitle}>Understand your expenses better</Text>
        </View>
        <TouchableOpacity onPress={reload} style={{ padding: 8 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stickyHeader}>
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setSelectedTab('Monthly')} style={[styles.tab, selectedTab === 'Monthly' && styles.tabActive]}>
            <Text style={[styles.tabText, selectedTab === 'Monthly' && styles.tabTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Insights')} style={[styles.tab, selectedTab === 'Insights' && styles.tabActive]}>
            <Text style={[styles.tabText, selectedTab === 'Insights' && styles.tabTextActive]}>Insights</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.miniSummary}>
          <View>
            <Text style={styles.miniSummaryLabel}>This month</Text>
            <Text style={[styles.miniSummaryValue, { color: budgetColor }]}>{formatCurrency(currentMonthTotal, user?.currency)}</Text>
          </View>
          <View style={styles.miniRight}>
            <Text style={styles.miniPercent}>{percentUsed}%</Text>
          </View>
        </View>
      </View>

      {selectedTab === 'Monthly' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Summary</Text>
          {monthlyCategoryLoading ? (
            <ActivityIndicator />
          ) : monthlyBudget > 0 ? (
            <View>
              <Text style={{ fontSize: 14, color: COLORS.gray, marginBottom: 8 }}>Budget usage</Text>
              <View style={styles.budgetBar}>
                <View style={[styles.budgetProgress, { width: `${Math.min(percentUsed, 100)}%`, backgroundColor: budgetColor }]} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: COLORS.dark }}>Used: {percentUsed}%</Text>
                <Text style={{ fontSize: 14, color: COLORS.dark }}>{formatCurrency(currentMonthTotal, user?.currency)} / {formatCurrency(monthlyBudget, user?.currency)}</Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: COLORS.gray, marginTop: 10 }}>No budget set for this month</Text>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current Month</Text>
            <Text style={styles.summaryValue}>{formatCurrency(currentMonthTotal, user?.currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Previous Month</Text>
            <Text style={styles.summaryValue}>{formatCurrency(insights?.previousMonthTotal || 0, user?.currency)}</Text>
          </View>
        </View>
      )}

      {selectedTab === 'Monthly' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category Breakdown</Text>
          {isLoadingCategoryBreakdown ? (
            <ActivityIndicator />
          ) : chartData.length > 0 ? (
            <>
              <PieChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
              <View style={styles.breakdownList}>
                {categoryBreakdown?.breakdown?.map((item) => (
                  <View key={item.category} style={styles.breakdownItem}>
                    <View style={styles.breakdownLeft}>
                      <View style={[styles.colorDot, { backgroundColor: getColor(item.category) }]} />
                      <Text style={styles.breakdownCategory}>{item.category}</Text>
                    </View>
                    <View style={styles.breakdownRight}>
                      <Text style={styles.breakdownAmount}>{formatCurrency(item.amount, user?.currency)}</Text>
                      <Text style={styles.breakdownPercentage}>{item.percentage}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={{ color: COLORS.gray, marginTop: 10 }}>No category breakdown data available</Text>
          )}
        </View>
      )}

      {selectedTab === 'Insights' && (
        isLoadingInsights ? (
          <View style={styles.card}><ActivityIndicator /></View>
        ) : insights?.insights && insights.insights.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Insights</Text>
            {insights.insights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <Ionicons
                  name={insight.percentageChange > 0 ? 'trending-up' : 'trending-down'}
                  size={18}
                  color={insight.percentageChange > 0 ? COLORS.danger : COLORS.success}
                />
                <View style={styles.insightContent}>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                  <View style={styles.insightDetails}>
                    <Text style={styles.insightDetail}>
                      Current: {formatCurrency(insight.currentAmount, user?.currency)}
                    </Text>
                    {insight.previousAmount !== undefined && (
                      <Text style={styles.insightDetail}>
                        Previous: {formatCurrency(insight.previousAmount, user?.currency)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark },
  headerSubtitle: { fontSize: 14, color: COLORS.gray, marginTop: 2 },
  card: { backgroundColor: COLORS.white, margin: 20, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.dark, marginBottom: 15 },
  breakdownList: { marginTop: 10 },
  breakdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  breakdownCategory: { fontSize: 14, color: COLORS.dark },
  breakdownRight: { alignItems: 'flex-end' },
  breakdownAmount: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  breakdownPercentage: { fontSize: 12, color: COLORS.gray },
  insightCard: { flexDirection: 'row', backgroundColor: COLORS.light, padding: 15, borderRadius: 12, marginBottom: 10 },
  insightContent: { flex: 1, marginLeft: 12 },
  insightMessage: { fontSize: 14, color: COLORS.dark, fontWeight: '500' },
  insightDetails: { marginTop: 5 },
  insightDetail: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryLabel: { fontSize: 14, color: COLORS.gray },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  budgetBar: { height: 8, backgroundColor: COLORS.light, borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  budgetProgress: { height: '100%', borderRadius: 4 },
  /* new styles for sticky mini summary and smaller tab fonts/icons */
  stickyHeader: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabBar: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.dark },
  tabTextActive: { fontWeight: '600', color: COLORS.primary },
  miniSummary: { paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniSummaryLabel: { fontSize: 12, color: COLORS.gray },
  miniSummaryValue: { fontSize: 14, fontWeight: '700' },
  miniPercent: { fontSize: 12, fontWeight: '700' },
  miniRight: { alignItems: 'flex-end' }
});
