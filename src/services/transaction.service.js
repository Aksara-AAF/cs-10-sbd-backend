const Transaction = require('../models/transaction.model');
const Item = require('../models/item.model');
const User = require('../models/user.model');
const { AppError } = require('../middleware/errorHandler');

class TransactionService {
  static async createTransaction({ user_id, item_id, quantity, description }) {
    // Get item price
    const item = await Item.findById(item_id);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Check stock
    if (item.stock < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    const total = item.price * quantity;
    const transaction = await Transaction.create({ user_id, item_id, quantity, total, description });
    return transaction;
  }

  static async getTransactionById(id) {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    return transaction;
  }

  static async payTransaction(transactionId) {
    // Simple update status to paid, no balance check
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    if (transaction.status !== 'pending') {
      throw new AppError('Transaction is not pending', 400);
    }
    // Update status
    await Transaction.updateStatus(transactionId, 'paid');
    return { transactionId };
  }

  static async deleteTransaction(id) {
    const transaction = await Transaction.delete(id);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    return transaction;
  }
}

module.exports = TransactionService;