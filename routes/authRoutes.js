const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/", authController.renderLoginPage);
router.get("/logout", authController.logoutUser);
router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);
// router.get('/forgot-password', authController.renderForgotPasswordPage);
// router.post('/forgot-password', authController.sendResetPasswordEmail);
// router.get('/reset-password/:token', authController.renderResetPasswordPage);
// router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
