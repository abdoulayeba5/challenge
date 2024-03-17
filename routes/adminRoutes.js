const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Définir les routes pour les pages d'administration
router.get("/dashboard", adminController.renderAdminHomePage);
router.post("/import", adminController.importDataFromExcel);
router.get("/manageUsers", adminController.renderManageUsersPage);
router.get("/manageData", adminController.renderManageDataPage);

module.exports = router;
