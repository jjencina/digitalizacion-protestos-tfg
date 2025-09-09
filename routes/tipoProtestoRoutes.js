const express = require('express');
const router = express.Router();
const TipoProtestoController = require('../controladores/tipoProtestoControlador');

// CRUD tipos de protesto
router.get('/search', TipoProtestoController.search);

router.get('/', TipoProtestoController.getAll);

router.get('/:id', TipoProtestoController.getById);

router.post('/', TipoProtestoController.create);

router.put('/:id', TipoProtestoController.update);

router.delete('/:id', TipoProtestoController.delete);

module.exports = router;