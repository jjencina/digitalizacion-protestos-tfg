const express = require('express');
const router = express.Router();
const CiudadController = require('../controladores/ciudadControlador');
const SACiudad = require('../negocio/SACiudad');

// GET all 
router.get('/', CiudadController.getAll);

// Buscar ciudad/es por nombre
router.get('/search', CiudadController.search);

// Ruta para obtener estadísticas de ciudades para el mapa
router.get('/estadisticas-mapa', (req, res) => {
    SACiudad.getCityStatistics((err, estadisticas) => {
        if (err) {
            console.error('Error obteniendo estadísticas del mapa:', err);
            return res.status(500).json({ 
                error: 'Error interno del servidor',
                details: err.message 
            });
        }
        res.json(estadisticas);
    });
});

// Obtener conexiones entre ciudades
router.get('/conexiones', CiudadController.getCityConnections);

//CRUD ciudad
router.get('/:id', CiudadController.getById);

router.post('/', CiudadController.create);

router.put('/:id', CiudadController.update);

router.delete('/:id', CiudadController.delete);

module.exports = router;