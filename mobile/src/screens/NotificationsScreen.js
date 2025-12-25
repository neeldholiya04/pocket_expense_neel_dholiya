import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

export default function NotificationsScreen() {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(true);
  const [budgetWarning, setBudgetWarning] = useState(true);
  const [unusualSpending, setUnusualSpending] = useState(false);

  const [reminderTime, setReminderTime] = useState('20:00');

  const handleTimeChange = () => {
    Alert.alert('Set Reminder Time', 'Time picker coming soon');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={60} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Stay on Track</Text>
        <Text style={styles.headerSubtitle}>
          Get timely reminders to track your expenses and manage your budget
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily</Text>

        <View style={styles.notificationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="time" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Daily Reminder</Text>
                <Text style={styles.cardDescription}>
                  Remind me to log expenses every day
                </Text>
              </View>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={dailyReminder ? COLORS.primary : COLORS.gray}
            />
          </View>

          {dailyReminder && (
            <TouchableOpacity style={styles.timeSelector} onPress={handleTimeChange}>
              <Ionicons name="alarm-outline" size={20} color={COLORS.gray} />
              <Text style={styles.timeText}>Reminder at {reminderTime}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly</Text>

        <View style={styles.notificationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.info + '20' }]}>
                <Ionicons name="stats-chart" size={24} color={COLORS.info} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Weekly Summary</Text>
                <Text style={styles.cardDescription}>
                  Get your weekly spending report every Sunday
                </Text>
              </View>
            </View>
            <Switch
              value={weeklyReport}
              onValueChange={setWeeklyReport}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={weeklyReport ? COLORS.primary : COLORS.gray}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly</Text>

        <View style={styles.notificationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="calendar" size={24} color={COLORS.success} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Monthly Report</Text>
                <Text style={styles.cardDescription}>
                  Detailed insights at the end of each month
                </Text>
              </View>
            </View>
            <Switch
              value={monthlyReport}
              onValueChange={setMonthlyReport}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={monthlyReport ? COLORS.primary : COLORS.gray}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Smart Alerts</Text>

        <View style={styles.notificationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="warning" size={24} color={COLORS.warning} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Budget Warning</Text>
                <Text style={styles.cardDescription}>
                  Alert when you reach 80% of your budget
                </Text>
              </View>
            </View>
            <Switch
              value={budgetWarning}
              onValueChange={setBudgetWarning}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={budgetWarning ? COLORS.primary : COLORS.gray}
            />
          </View>
        </View>

        <View style={styles.notificationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.danger + '20' }]}>
                <Ionicons name="alert-circle" size={24} color={COLORS.danger} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Unusual Spending</Text>
                <Text style={styles.cardDescription}>
                  Notify when spending is higher than usual
                </Text>
              </View>
            </View>
            <Switch
              value={unusualSpending}
              onValueChange={setUnusualSpending}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={unusualSpending ? COLORS.primary : COLORS.gray}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: Regular reminders help you stay consistent with expense tracking
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 15,
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardText: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8
  },
  timeText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark
  },
  footer: {
    backgroundColor: COLORS.light,
    margin: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 40
  },
  footerText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18
  }
});
