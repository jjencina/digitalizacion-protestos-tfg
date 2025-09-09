const express = require('express');
const router = express.Router();
const EndosoController = require('../controladores/endosoControlador');

//CRUD
router.get('/', EndosoController.getAll);
router.get('/:id', EndosoController.getById);
router.post('/', EndosoController.create);
router.put('/:id', EndosoController.update);
router.delete('/:id', EndosoController.delete);

// Tipos de negociación
router.get('/tipos/negociacion', EndosoController.getTiposNegociacion);


module.exports = router;