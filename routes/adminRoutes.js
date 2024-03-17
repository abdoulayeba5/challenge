const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Définir les routes pour les pages d'administration
router.get("/dashboard", adminController.renderAdminHomePage);
router.post("/import", adminController.importDataFromExcel);
router.get("/manageUsers", adminController.renderManageUsersPage);
router.get("/manageData", adminController.renderManageDataPage);
router.get("/add_jury", adminController.addjuryMember);
router.post("/new_jury", adminController.newJuryMember);
router.get("/grille", adminController.grille);
router.post("/add_critere", adminController.addCriter);
router.get("/home", adminController.addjuryMember);

module.exports = router;
