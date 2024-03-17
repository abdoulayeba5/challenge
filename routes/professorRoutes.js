const express = require("express");
const router = express.Router();
const professorController = require("../controllers/professorController");

router.get("/noter", professorController.grille);
router.get("/", professorController.acceuil);
router.get("/equipe", professorController.equipes);
router.post("/evaluer", professorController.newEvaluation);

module.exports = router;
