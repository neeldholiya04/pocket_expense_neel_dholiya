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

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all temporary data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your expense data will be exported as CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Data exported successfully');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive expense reminders</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={notifications ? COLORS.primary : COLORS.gray}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Budget Alerts</Text>
              <Text style={styles.settingDescription}>Alert when near budget limit</Text>
            </View>
          </View>
          <Switch
            value={budgetAlerts}
            onValueChange={setBudgetAlerts}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={budgetAlerts ? COLORS.primary : COLORS.gray}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="finger-print" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Biometric Login</Text>
              <Text style={styles.settingDescription}>Use fingerprint or Face ID</Text>
            </View>
          </View>
          <Switch
            value={biometric}
            onValueChange={setBiometric}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={biometric ? COLORS.primary : COLORS.gray}
          />
        </View>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="key-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your password</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Coming soon</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            disabled
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={COLORS.gray}
          />
        </View>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="color-palette-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Currency</Text>
              <Text style={styles.settingDescription}>USD</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
          <View style={styles.settingLeft}>
            <Ionicons name="download-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>Download as CSV</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
          <View style={styles.settingLeft}>
            <Ionicons name="trash-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.settingDescription}>Free up storage space</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.gray} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>App Version</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </View>
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
  section: {
    backgroundColor: COLORS.white,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 5,
    letterSpacing: 0.5
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 15
  },
  settingText: {
    flex: 1
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 2
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.gray
  }
});
