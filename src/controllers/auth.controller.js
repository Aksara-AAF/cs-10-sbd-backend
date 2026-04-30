const UserService = require('../services/user.service');
const jwt = require('jsonwebtoken');

class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      const { user } = result;

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        payload: {
          token,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;