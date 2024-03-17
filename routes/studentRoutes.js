const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', studentController.renderStudentPage);
router.get('/equipe', studentController.selectEquipe);

module.exports = router;
