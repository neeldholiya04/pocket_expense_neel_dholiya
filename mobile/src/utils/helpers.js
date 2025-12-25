export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  }
};

export const formatLongDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getMonthName = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return {
    startDate: startOfMonth.toISOString(),
    endDate: endOfMonth.toISOString()
  };
};

export const getTodayRange = () => {
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));
  
  return {
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString()
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const getCategoryColor = (category) => {
  const colors = {
    'Food': '#FF6B6B',
    'Transportation': '#4ECDC4',
    'Shopping': '#FFE66D',
    'Entertainment': '#95E1D3',
    'Bills': '#F38181',
    'Healthcare': '#AA96DA',
    'Education': '#FCBAD3',
    'Travel': '#A8E6CF',
    'Other': '#C7CEEA'
  };
  return colors[category] || '#C7CEEA';
};
