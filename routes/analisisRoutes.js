const express = require('express');
const router = express.Router();
//const analisisController = require('../controladores/formularioControlador');
const SACiudad = require('../negocio/SACiudad');

router.get('/', function(req, res, next) {
    res.render('analisis/analisis');
});

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

module.exports = router;