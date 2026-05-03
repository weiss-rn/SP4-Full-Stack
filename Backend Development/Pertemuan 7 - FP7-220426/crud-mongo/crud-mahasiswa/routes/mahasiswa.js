const express = require('express');
const router = express.Router();
const mahasiswaController = require('../controllers/mahasiswaController');

// READ: Get all mahasiswa
router.get('/', mahasiswaController.getAll);

// CREATE: Form and POST
router.get('/add', mahasiswaController.addForm);
router.post('/add', mahasiswaController.create);

// UPDATE: Form and POST
router.get('/edit/:id', mahasiswaController.editForm);
router.post('/edit/:id', mahasiswaController.update);

// DELETE
router.get('/delete/:id', mahasiswaController.delete);

module.exports = router;
