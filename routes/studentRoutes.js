const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.renderStudentPage);
router.get('/acceuil', studentController.renderStudentPage);
router.get('/equipe', studentController.selectEquipe);
router.get('/equipe_insert', studentController.equipe_insert);

module.exports = router;
