import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const OFFLINE_EXPENSES_KEY = 'offline_expenses';
const OFFLINE_QUEUE_KEY = 'offline_queue';

const getOfflineExpenses = async () => {
  try {
    const expenses = await AsyncStorage.getItem(OFFLINE_EXPENSES_KEY);
    return expenses ? JSON.parse(expenses) : [];
  } catch (error) {
    return [];
  }
};

const getOfflineQueue = async () => {
  try {
    const q = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return q ? JSON.parse(q) : [];
  } catch (e) {
    return [];
  }
};

const saveOfflineQueue = async (queue) => {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
  }
};

const pushToOfflineQueue = async (item) => {
  const q = await getOfflineQueue();
  q.push(item);
  await saveOfflineQueue(q);
};

const saveOfflineExpense = async (expense) => {
  try {
    const offlineExpenses = await getOfflineExpenses();
    const tempId = `temp_${Date.now()}`;
    const offlineItem = { ...expense, _id: tempId, clientId: tempId, synced: false };
    offlineExpenses.push(offlineItem);
    await AsyncStorage.setItem(OFFLINE_EXPENSES_KEY, JSON.stringify(offlineExpenses));
    return offlineExpenses;
  } catch (error) {
    throw error;
  }
};

export const createExpense = createAsyncThunk(
  'expenses/create',
  async (expenseData, thunkAPI) => {
    try {
      const response = await api.post('/expenses', expenseData);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      if (!error.response) {
        const offlineExpenses = await saveOfflineExpense(expenseData);
        const last = offlineExpenses[offlineExpenses.length - 1];
        await pushToOfflineQueue({ action: 'create', expense: last });
        return thunkAPI.rejectWithValue({ offline: true, expenses: offlineExpenses });
      }
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const getExpenses = createAsyncThunk(
  'expenses/getAll',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/expenses', { params });
      if (response.data.success) {
        const offlineExpenses = await getOfflineExpenses();
        const allExpenses = [...response.data.data, ...offlineExpenses];
        return allExpenses;
      }
    } catch (error) {
      if (!error.response) {
        const offlineExpenses = await getOfflineExpenses();
        return offlineExpenses;
      }
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await api.put(`/expenses/${id}`, data);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      if (!error.response) {
        const updatedExpense = { ...data, _id: id, synced: false };
        await pushToOfflineQueue({ action: 'update', id, data });
        return updatedExpense;
      }
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/expenses/${id}`);
      return id;
    } catch (error) {
      if (!error.response) {
        await pushToOfflineQueue({ action: 'delete', id });
        return id;
      }
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCategoryBreakdown = createAsyncThunk(
  'expenses/categoryBreakdown',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/expenses/analytics/category-breakdown', { params });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      if (!error.response) {
        try {
          const state = thunkAPI.getState();
          const expenses = state.expenses.expenses || [];
          let filtered = expenses;
          if (params?.startDate || params?.endDate) {
            filtered = expenses.filter(e => {
              const d = new Date(e.date);
              if (params.startDate && d < new Date(params.startDate)) return false;
              if (params.endDate && d > new Date(params.endDate)) return false;
              return true;
            });
          }

          const group = filtered.reduce((acc, e) => {
            acc[e.category] = acc[e.category] || { category: e.category, amount: 0, count: 0 };
            acc[e.category].amount += Number(e.amount || 0);
            acc[e.category].count += 1;
            return acc;
          }, {});

          const breakdown = Object.values(group).sort((a, b) => b.amount - a.amount);
          const totalSpent = breakdown.reduce((s, it) => s + it.amount, 0);
          const data = breakdown.map(item => ({
            category: item.category,
            amount: item.amount,
            count: item.count,
            percentage: totalSpent > 0 ? ((item.amount / totalSpent) * 100).toFixed(2) : 0
          }));

          return { breakdown: data, totalSpent };
        } catch (e) {
          return thunkAPI.rejectWithValue('Failed to compute breakdown offline');
        }
      }
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getInsights = createAsyncThunk(
  'expenses/insights',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/expenses/analytics/insights');
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      if (!error.response) {
        try {
          const state = thunkAPI.getState();
          const expenses = state.expenses.expenses || [];
          const user = state.auth.user || {};
          const now = new Date();

          const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

          const byCategory = (arr, start, end) => {
            const filtered = arr.filter(e => {
              const d = new Date(e.date);
              return d >= start && d <= end;
            });
            return filtered.reduce((m, e) => {
              m[e.category] = (m[e.category] || 0) + Number(e.amount || 0);
              return m;
            }, {});
          };

          const currentMap = byCategory(expenses, currentMonthStart, currentMonthEnd);
          const previousMap = byCategory(expenses, previousMonthStart, previousMonthEnd);

          const insightsArr = [];
          for (const [category, currentAmount] of Object.entries(currentMap)) {
            const previousAmount = previousMap[category] || 0;
            if (previousAmount > 0) {
              const difference = currentAmount - previousAmount;
              const rawPercent = (difference / previousAmount) * 100;
              const percentageChange = parseFloat(rawPercent.toFixed(2));
              if (Math.abs(percentageChange) >= 10) {
                insightsArr.push({
                  category,
                  message: `You spent ${Math.abs(percentageChange).toFixed(2)}% ${difference > 0 ? 'more' : 'less'} on ${category} this month`,
                  currentAmount,
                  previousAmount,
                  difference,
                  percentageChange
                });
              }
            } else if (currentAmount > 0) {
              insightsArr.push({
                category,
                message: `New spending category: ${category}`,
                currentAmount,
                previousAmount: 0,
                difference: currentAmount,
                percentageChange: 100
              });
            }
          }

          const currentMonthTotal = Object.values(currentMap).reduce((s, v) => s + v, 0);
          const previousMonthTotal = Object.values(previousMap).reduce((s, v) => s + v, 0);

          if (user?.monthlyBudget > 0) {
            const budgetUsed = parseFloat(((currentMonthTotal / user.monthlyBudget) * 100).toFixed(2));
            if (budgetUsed >= 90) {
              insightsArr.push({
                category: 'Budget',
                message: `You've used ${budgetUsed}% of your monthly budget`,
                currentAmount: currentMonthTotal,
                budget: user.monthlyBudget,
                percentageChange: budgetUsed
              });
            }
          }

          return {
            insights: insightsArr,
            currentMonthTotal,
            previousMonthTotal,
            monthlyBudget: user?.monthlyBudget || 0
          };
        } catch (e) {
          return thunkAPI.rejectWithValue('Failed to compute insights offline');
        }
      }
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const syncOfflineExpenses = createAsyncThunk(
  'expenses/sync',
  async (_, thunkAPI) => {
    try {
      const offlineExpenses = await getOfflineExpenses();
      const queue = await getOfflineQueue();

      const results = [];

      if (offlineExpenses.length > 0) {
        try {
          const response = await api.post('/expenses/sync', { expenses: offlineExpenses.map(e => ({
            amount: e.amount,
            category: e.category,
            paymentMethod: e.paymentMethod,
            description: e.description,
            date: e.date,
            clientId: e.clientId || e._id
          })) });

          if (response.data.success) {
            const syncedItems = response.data.data.synced || [];

            const tempToServerMap = {};
            for (const serverItem of syncedItems) {
              if (serverItem.clientId) {
                tempToServerMap[serverItem.clientId] = serverItem._id;
              }
            }

            await AsyncStorage.removeItem(OFFLINE_EXPENSES_KEY);
            results.push(...syncedItems);

            if (queue.length > 0) {
              const updatedQueue = queue.map(item => {
                try {
                  if (item.id && String(item.id).startsWith('temp_') && tempToServerMap[item.id]) {
                    return { ...item, id: tempToServerMap[item.id] };
                  }
                  if (item.expense && item.expense.clientId && tempToServerMap[item.expense.clientId]) {
                    return { ...item, expense: { ...item.expense, _id: tempToServerMap[item.expense.clientId], clientId: undefined } };
                  }
                  return item;
                } catch (e) {
                  return item;
                }
              });
              await saveOfflineQueue(updatedQueue);
              queue.length = 0;
              Array.prototype.push.apply(queue, updatedQueue);
            }
          }
        } catch (e) {
        }
      }

      if (queue.length > 0) {
        const newQueue = [];
        for (const item of queue) {
          try {
            if (item.action === 'update') {
              if (item.id && !String(item.id).startsWith('temp_')) {
                await api.put(`/expenses/${item.id}`, item.data);
              } else {
                newQueue.push(item);
              }
            } else if (item.action === 'delete') {
              if (item.id && !String(item.id).startsWith('temp_')) {
                await api.delete(`/expenses/${item.id}`);
              } else {
              }
            } else if (item.action === 'create') {
            }
          } catch (e) {
            newQueue.push(item);
          }
        }

        await saveOfflineQueue(newQueue);
      }

      return results;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
    expensesVersion: 0,
    categoryBreakdown: null,
    insights: null,
    isLoading: false,
    isLoadingCategoryBreakdown: false,
    isLoadingInsights: false,
    isSuccess: false,
    isError: false,
    message: ''
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isLoadingCategoryBreakdown = false;
      state.isLoadingInsights = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses.unshift(action.payload);
        state.expensesVersion++;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload?.offline) {
          state.isSuccess = true;
          state.expenses = action.payload.expenses;
          state.expensesVersion++;
        } else {
          state.isError = true;
          state.message = action.payload?.message || 'Failed to create expense';
        }
      })
      .addCase(getExpenses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses = action.payload;
        state.expensesVersion++;
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses = state.expenses.map(expense =>
          expense._id === action.payload._id ? action.payload : expense
        );
        state.expensesVersion++;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses = state.expenses.filter(expense => expense._id !== action.payload);
        state.expensesVersion++;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCategoryBreakdown.pending, (state) => {
        state.isLoadingCategoryBreakdown = true;
      })
      .addCase(getCategoryBreakdown.fulfilled, (state, action) => {
        state.isLoadingCategoryBreakdown = false;
        state.isSuccess = true;
        state.categoryBreakdown = action.payload;
      })
      .addCase(getCategoryBreakdown.rejected, (state, action) => {
        state.isLoadingCategoryBreakdown = false;
        state.isError = true;
        state.message = action.payload || 'Failed to load category breakdown';
      })
      .addCase(getInsights.pending, (state) => {
        state.isLoadingInsights = true;
      })
      .addCase(getInsights.fulfilled, (state, action) => {
        state.isLoadingInsights = false;
        state.isSuccess = true;
        state.insights = action.payload;
      })
      .addCase(getInsights.rejected, (state, action) => {
        state.isLoadingInsights = false;
        state.isError = true;
        state.message = action.payload || 'Failed to load insights';
      })
      .addCase(syncOfflineExpenses.fulfilled, (state, action) => {
        state.isSuccess = true;
        const syncedItems = action.payload || [];
        const mapByClient = {};
        for (const si of syncedItems) {
          if (si.clientId) mapByClient[si.clientId] = si;
        }
        state.expenses = state.expenses.map(expense => {
          if (expense._id && String(expense._id).startsWith('temp_') && mapByClient[expense._id]) {
            const si = mapByClient[expense._id];
            return { ...si, synced: true };
          }
          return expense;
        });
        state.expensesVersion++;
      });
  }
});

export const { reset } = expenseSlice.actions;
export default expenseSlice.reducer;
