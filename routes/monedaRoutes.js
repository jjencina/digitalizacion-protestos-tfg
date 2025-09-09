const express = require('express');
const router = express.Router();
const MonedaController = require('../controladores/monedaControlador');

// CRUD Monedas
router.get('/', MonedaController.getAll);

router.get('/search', MonedaController.search);

router.get('/:id', MonedaController.getById);

router.post('/', MonedaController.create);

router.put('/:id', MonedaController.update);

router.delete('/:id', MonedaController.delete);

module.exports = router;