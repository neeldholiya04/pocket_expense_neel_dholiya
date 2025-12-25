import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout, updateProfile } from '../store/slices/authSlice';
import { COLORS } from '../constants';

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget?.toString() || '');
  const [editing, setEditing] = useState(false);

  const handleUpdateBudget = () => {
    const budget = parseFloat(monthlyBudget);
    if (budget < 0) {
      Alert.alert('Error', 'Budget cannot be negative');
      return;
    }
    
    dispatch(updateProfile({ monthlyBudget: budget }));
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Settings</Text>
        
        <View style={styles.card}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.cardLabel}>Monthly Budget</Text>
              <Text style={styles.cardSubtext}>Set your spending limit</Text>
            </View>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Ionicons name="pencil" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter budget"
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
                keyboardType="decimal-pad"
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setMonthlyBudget(user?.monthlyBudget?.toString() || '');
                    setEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleUpdateBudget}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.budgetAmount}>
              {user?.monthlyBudget > 0 ? `$${user.monthlyBudget.toFixed(2)}` : 'Not set'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color={COLORS.gray} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.gray} />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.gray} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.gray} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', padding: 30, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark },
  email: { fontSize: 14, color: COLORS.gray, marginTop: 5 },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: COLORS.gray, marginBottom: 10, textTransform: 'uppercase' },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardLabel: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  cardSubtext: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  budgetAmount: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  editContainer: { marginTop: 10 },
  input: { backgroundColor: COLORS.light, borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  editButtons: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: COLORS.light, borderWidth: 1, borderColor: COLORS.border },
  saveButton: { backgroundColor: COLORS.primary },
  cancelButtonText: { color: COLORS.dark, fontWeight: '600' },
  saveButtonText: { color: COLORS.white, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  menuText: { flex: 1, fontSize: 16, color: COLORS.dark, marginLeft: 15 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.danger },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.danger, marginLeft: 10 },
  version: { textAlign: 'center', color: COLORS.gray, fontSize: 12, marginVertical: 30 }
});
