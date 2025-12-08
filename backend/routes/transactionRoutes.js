const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Generate unique reference number
const generateReference = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Count today's transactions to get sequence number
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const count = await Transaction.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  return `TXN${year}${month}${day}${sequence}`;
};

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Get transaction statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    const incomeTransactions = await Transaction.find({ 
      ...dateQuery, 
      type: 'Income' 
    });
    
    const expenseTransactions = await Transaction.find({ 
      ...dateQuery, 
      type: 'Expense' 
    });

    const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const expenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    res.json({
      totalBalance: income - expenses,
      income,
      expenses,
      net: income - expenses,
      transactionCount: incomeTransactions.length + expenseTransactions.length
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({
      message: 'Failed to fetch transaction statistics',
      error: error.message
    });
  }
});

// Create a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const {
      date,
      description,
      category,
      type,
      amount,
      reference,
      relatedBillId,
      notes
    } = req.body;

    // Validate required fields
    if (!description || !category || !type || !amount) {
      return res.status(400).json({
        message: 'Please provide all required fields: description, category, type, and amount'
      });
    }

    // Auto-generate reference if not provided
    const transactionReference = reference || await generateReference();

    // Ensure expense amounts are negative
    const finalAmount = type === 'Expense' ? -Math.abs(amount) : Math.abs(amount);

    // Create transaction
    const transaction = new Transaction({
      date: date || new Date(),
      description,
      category,
      type,
      amount: finalAmount,
      reference: transactionReference,
      relatedBillId,
      notes,
      createdBy: req.user.id
    });

    await transaction.save();

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      message: 'Failed to create transaction',
      error: error.message
    });
  }
});

// Get transaction by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      date,
      description,
      category,
      type,
      amount,
      notes
    } = req.body;

    const updateData = {};
    if (date) updateData.date = date;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (type) updateData.type = type;
    if (amount !== undefined) {
      updateData.amount = type === 'Expense' ? -Math.abs(amount) : Math.abs(amount);
    }
    if (notes !== undefined) updateData.notes = notes;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      message: 'Failed to update transaction',
      error: error.message
    });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      message: 'Failed to delete transaction',
      error: error.message
    });
  }
});

module.exports = router;
