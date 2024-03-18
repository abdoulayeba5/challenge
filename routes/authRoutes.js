const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/", authController.renderLoginPage);
router.get("/logout", authController.logoutUser);
router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);
router.post("/verify_code_registre", authController.verifyRegistre);
router.get('/forgot-password', authController.renderForgotPasswordPage);
router.post('/forgot-password', authController.sendResetPasswordEmail);
router.get('/verify-code', authController.verifypasswordcodePage);
router.post('/verify-code', authController.verifypasswordcode);
router.get('/reset-password', authController.renderResetPasswordPage);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
