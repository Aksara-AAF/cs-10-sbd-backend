const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// TODO: Buat endpoint login baru di /auth/login yang mengembalikan JWT token
// Payload JWT: userId, email, expiry 24 jam
// Gunakan UserService.login yang sudah ada.
router.post('/login', AuthController.login);

module.exports = router;