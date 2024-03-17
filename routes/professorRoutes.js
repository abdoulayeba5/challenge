const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');

router.get('/noter', professorController.grille);

module.exports = router;
