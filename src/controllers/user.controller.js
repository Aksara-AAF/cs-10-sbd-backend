const UserService = require('../services/user.service');
const { AppError } = require('../middleware/errorHandler');
const redis = require('../database/redis');
const { json } = require('express');

class UserController {
  static async register(req, res, next) {
    try {
      const { name, username, email, phone, password } = req.body;
      const user = await UserService.register({ name, username, email, phone, password });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { id, name, username, email, phone, password, balance } = req.body;
      const updatedUser = await UserService.updateProfile(id, { name, username, email, phone, password, balance });

      const key = `user${email}`;
      await redis.del(key);
      res.status(200).json({
        success: true,
        message: 'User updated successfully and cache invalidated',
        payload: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user ? (req.user.userId || req.user.id) : (req.query.user_id || 1);
      const history = await UserService.getTransactionHistory(userId);
      res.status(200).json({
        success: true,
        message: 'Transaction history retrieved',
        payload: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTotalSpent(req, res, next) {
    try {
      const userId = req.user ? (req.user.userId || req.user.id) : (req.query.user_id || 1);
      const totalSpent = await UserService.getTotalSpent(userId);
      res.status(200).json({
        success: true,
        message: 'Total spent retrieved',
        payload: { total_spent: totalSpent },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserByEmail(req, res, next) {
    try {
      const { email } = req.params;
      const key = `user:{$email}`;
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.status(200).json({
          success: true,
          message: 'Successfully Get User By Email With Redis (Cache Hit)',
          payload: JSON.parse(cachedData),
      });
      }
      const products = await UserService.getUserByEmail(email);
      await redis.setex(key, 60, JSON.stringify(products));
      return res.status(200).json({
            success: true,
            message: 'Successfully Get User By Email From DB (Cache Miss)',
            payload: products,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;