const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/", authController.renderLoginPage);
router.get("/logout", authController.logoutUser);
router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);
router.post("/verify_code_registre", authController.verifyRegistre);
// router.get('/forgot-password', authController.renderForgotPasswordPage);
// router.post('/forgot-password', authController.sendResetPasswordEmail);
// router.get('/reset-password/:token', authController.renderResetPasswordPage);
// router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
