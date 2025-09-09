const express = require('express');
const router = express.Router();
const LetraController = require('../controladores/letraCambioControlador');

// Buscar tipos de letra
router.get('/tipos/letra/search', LetraController.searchTiposLetra);

// CRUD letras
router.get('/', LetraController.getAll);
router.get('/:id', LetraController.getById);
router.post('/', LetraController.create);
router.put('/:id', LetraController.update);
router.delete('/:id', LetraController.delete);

// Tipos de valor
router.get('/tipos/valor', LetraController.getTiposValor);
//tipos de plazo
router.get('/tipos/plazo', LetraController.getTiposPlazo);

// RUTAS PARA RELACIONES LETRAS-ENDOSOS
router.get('/relaciones/endosos', LetraController.getAllRelacionesEndosos);
router.get('/relaciones/endosos/:id', LetraController.getRelacionEndosoById);
router.post('/relaciones/endosos/create', LetraController.createRelacionEndoso);
router.put('/relaciones/endosos/update', LetraController.updateRelacionEndoso);
router.delete('/relaciones/endosos/:id', LetraController.deleteRelacionEndoso);
router.get('/:letraId/endosos', LetraController.getEndososByLetra);
router.get('/endosos/:endosoId/letras', LetraController.getLetrasByEndoso);



module.exports = router;