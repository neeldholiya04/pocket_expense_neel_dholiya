const Expense = require('../models/Expense');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res, next) => {
  try {
    const { amount, category, paymentMethod, description, date } = req.body;

    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      paymentMethod,
      description,
      date: date || Date.now()
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const { startDate, endDate, category, view } = req.query;

    // Build query
    let query = { user: req.user.id };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    } else if (view) {
      const now = new Date();
      if (view === 'daily') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        query.date = { $gte: startOfDay, $lte: endOfDay };
      } else if (view === 'monthly') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        query.date = { $gte: startOfMonth, $lte: endOfMonth };
      }
    }

    // Category filtering
    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this expense'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this expense'
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise breakdown
// @route   GET /api/expenses/analytics/category-breakdown
// @access  Private
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Cast user id to ObjectId for aggregation matching
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Build date match
    let match = { user: userId };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const breakdown = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalSpent = breakdown.reduce((sum, item) => sum + item.total, 0);

    const data = breakdown.map(item => ({
      category: item._id,
      amount: item.total,
      count: item.count,
      percentage: totalSpent > 0 ? ((item.total / totalSpent) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        breakdown: data,
        totalSpent
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending insights
// @route   GET /api/expenses/analytics/insights
// @access  Private
exports.getInsights = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Previous month
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Cast user id to ObjectId for aggregation matching
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get current month expenses by category
    const currentMonthByCategory = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get previous month expenses by category
    const previousMonthByCategory = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: previousMonthStart, $lte: previousMonthEnd }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate insights
    const insights = [];
    
    // Convert to maps for easier comparison
    const currentMap = new Map(currentMonthByCategory.map(item => [item._id, item.total]));
    const previousMap = new Map(previousMonthByCategory.map(item => [item._id, item.total]));

    // Compare each category
    for (const [category, currentAmount] of currentMap.entries()) {
      const previousAmount = previousMap.get(category) || 0;

      if (previousAmount > 0) {
        const difference = currentAmount - previousAmount;
        const rawPercent = (difference / previousAmount) * 100;
        const percentageChange = parseFloat(rawPercent.toFixed(2));

        if (Math.abs(percentageChange) >= 10) {
          insights.push({
            category,
            message: `You spent ${Math.abs(percentageChange).toFixed(2)}% ${difference > 0 ? 'more' : 'less'} on ${category} this month`,
            currentAmount,
            previousAmount,
            difference,
            percentageChange
          });
        }
      } else if (currentAmount > 0) {
        insights.push({
          category,
          message: `New spending category: ${category}`,
          currentAmount,
          previousAmount: 0,
          difference: currentAmount,
          percentageChange: 100
        });
      }
    }

    // Check budget
    const dbUser = await User.findById(req.user.id);
    const currentMonthTotal = Array.from(currentMap.values()).reduce((sum, val) => sum + val, 0);
    const previousMonthTotal = Array.from(previousMap.values()).reduce((sum, val) => sum + val, 0);

    if (dbUser?.monthlyBudget > 0) {
      const budgetUsed = parseFloat(((currentMonthTotal / dbUser.monthlyBudget) * 100).toFixed(2));

      if (budgetUsed >= 90) {
        insights.push({
          category: 'Budget',
          message: `You've used ${budgetUsed}% of your monthly budget`,
          currentAmount: currentMonthTotal,
          budget: dbUser.monthlyBudget,
          percentageChange: budgetUsed
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        insights,
        currentMonthTotal,
        previousMonthTotal,
        monthlyBudget: dbUser?.monthlyBudget || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync offline expenses
// @route   POST /api/expenses/sync
// @access  Private
exports.syncExpenses = async (req, res, next) => {
  try {
    const { expenses } = req.body;

    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of expenses'
      });
    }

    const syncedExpenses = [];
    const errors = [];

    for (let expenseData of expenses) {
      try {
        const { clientId, ...rest } = expenseData;

        const expense = await Expense.create({
          ...rest,
          user: req.user.id,
          synced: true
        });

        const result = {
          _id: expense._id,
          amount: expense.amount,
          category: expense.category,
          paymentMethod: expense.paymentMethod,
          description: expense.description,
          date: expense.date,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
          clientId: clientId
        };

        syncedExpenses.push(result);
      } catch (error) {
        errors.push({
          expense: expenseData,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        synced: syncedExpenses,
        errors
      }
    });
  } catch (error) {
    next(error);
  }
};
