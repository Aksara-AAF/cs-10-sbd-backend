const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { AppError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 10;

class UserService {
  static async register({ name, username, email, phone, password }) {
    // Check if user already exists by email
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      throw new AppError('User with this email already exists', 400);
    }
    // Note: username uniqueness is enforced by database constraint

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
    });

    return user;
  }

  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // No JWT, just return user data
    return { user: { id: user.id, name: user.name, username: user.username, email: user.email, phone: user.phone, balance: user.balance } };
  }

  static async updateProfile(id, updateData) {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    const updatedUser = await User.update(id, updateData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    return updatedUser;
  }

  static async getTransactionHistory(userId) {
    const transactions = await User.getTransactionHistory(userId);
    return transactions;
  }

  static async getTotalSpent(userId) {
    const total = await User.getTotalSpent(userId);
    return total;
  }

  static async getUserByEmail(email){
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('User with this email does not exist', 400);
    }
    return { user: { id: user.id, name: user.name, username: user.username, email: user.email, phone: user.phone, balance: user.balance } };;
  }
}

module.exports = UserService;