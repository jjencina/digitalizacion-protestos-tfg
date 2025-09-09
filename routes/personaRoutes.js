const express = require('express');
const router = express.Router();
const PersonaController = require('../controladores/personaControlador');

// CRUD Personas
router.get('/', PersonaController.getAll);

router.get('/search', PersonaController.search);

router.get('/:id', PersonaController.getById);

router.post('/', PersonaController.create);

router.put('/:id', PersonaController.update);

router.delete('/:id', PersonaController.delete);

module.exports = router;