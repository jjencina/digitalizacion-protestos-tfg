const express = require('express');
const router = express.Router();
const ProtestoController = require('../controladores/protestoControlador');
const tipoProtestoRoutes = require('./tipoProtestoRoutes');

// GET all protestos
router.get('/', ProtestoController.getAll);
router.get('/mostrarTodos', ProtestoController.getAll);

router.get('/filtrado', ProtestoController.getFiltered);

// CRUD Protestos
router.get('/:id', ProtestoController.getById);
router.post('/', ProtestoController.create);
// CREATE protesto sin letra ni endosos
router.post('/crearProtestoSimple', ProtestoController.createSimple);
router.put('/:id', ProtestoController.update);
router.delete('/:id', ProtestoController.delete);

// GET Tipos de protestos
router.use('/tipos/protestos', tipoProtestoRoutes);
// Buscar tipos de protesto
router.get('/tipos/protestos/search', ProtestoController.searchTiposProtesto);
router.delete('/tipos/protestos/:id', ProtestoController.deleteTipoProtesto);


// CRUD Relaciones protesto-letras
router.get('/relaciones/letras', ProtestoController.getAllRelacionesProtestos);
router.get('/relaciones/letras/:id', ProtestoController.getRelacionProtestoById);
router.post('/relaciones/letras/create', ProtestoController.createRelacionProtesto);
router.put('/relaciones/letras/update', ProtestoController.updateRelacionProtesto);
router.delete('/relaciones/letras/:id', ProtestoController.deleteRelacionProtesto);


module.exports = router;