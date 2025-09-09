const express = require('express');
const router = express.Router();
const FormularioController = require('../controladores/formularioControlador');

// Guardar formulario
router.post('/save', FormularioController.save);

// Obtener el último protesto
router.get('/last-protesto', FormularioController.getLastProtesto.bind(FormularioController));

module.exports = router;