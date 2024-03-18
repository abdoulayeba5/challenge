const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Définir les routes pour les pages d'administration
router.get("/dashboard", adminController.renderAdminHomePage);
router.post("/import", adminController.importDataFromExcel);
router.get("/add_jury", adminController.addjuryMember);
router.post("/new_jury", adminController.newJuryMember);
router.get("/grille", adminController.grille);
router.post("/add_critere", adminController.addCriter);
router.get("/home", adminController.addjuryMember);
router.post("/date_prof_update", adminController.dateprofupdate);
router.get("/date_prof", adminController.dateProf);
router.get("/date_open_prof", adminController.dateOpenProf);
router.get("/student", adminController.student);
router.get("/equipe", adminController.equipe);
router.get("/jury", adminController.jury);
router.get("/challenge", adminController.challenge);

module.exports = router;
