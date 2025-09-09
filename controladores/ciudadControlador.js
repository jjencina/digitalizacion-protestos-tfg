const SACiudad = require('../negocio/SACiudad');

class CiudadController {
    // GET ALL
    getAll(req, res) {
        SACiudad.getAllCiudades((err, ciudades) => {
            if (err) {
                console.error('Error in CiudadController.getAll:', err);
                return res.status(500).json({ error: 'Error getting ciudades' });
            }
            
            const ciudadesJSON = ciudades.map(ciudad => ciudad.toJSON());
            res.json(ciudadesJSON);
        });
    }

    // GET BY ID
    getById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SACiudad.getCiudadById(id, (err, ciudad) => {
            if (err) {
                console.error('Error in CiudadController.getById:', err);
                return res.status(500).json({ error: 'Error getting ciudad' });
            }
            if (!ciudad) {
                return res.status(404).json({ error: 'Ciudad not found' });
            }
            res.json(ciudad.toJSON());
        });
    }

    // CREATE
    create(req, res) {
        const ciudadData = {
            nombre_ciudad: req.body.nombre_ciudad,
            pais: req.body.pais,
            latitud: req.body.latitud !== undefined && req.body.latitud !== '' ? parseFloat(req.body.latitud) : null,
            longitud: req.body.longitud !== undefined && req.body.longitud !== '' ? parseFloat(req.body.longitud) : null
        };

        SACiudad.createCiudad(ciudadData, (err, ciudad) => {
            if (err) {
                console.error('Error in CiudadController.create:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error creating ciudad'
                });
            }
            
            res.status(201).json(ciudad.toJSON());
        });
    }

    // UPDATE
    update(req, res) {
        const id = req.params.id;
        const ciudadData = {
            nombre_ciudad: req.body.nombre_ciudad,
            pais: req.body.pais,
            latitud: req.body.latitud !== undefined && req.body.latitud !== '' ? parseFloat(req.body.latitud) : null,
            longitud: req.body.longitud !== undefined && req.body.longitud !== '' ? parseFloat(req.body.longitud) : null
        };

        SACiudad.updateCiudad(id, ciudadData, (err, ciudad) => {
            if (err) {
                console.error('Error in CiudadController.update:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error updating ciudad'
                });
            }
            
            res.json(ciudad.toJSON());
        });
    }

    // DELETE
    delete(req, res) {
        const id = req.params.id;
        SACiudad.deleteCiudad(id, (err, result) => {
            if (err) {
                console.error('Error in CiudadController.delete:', err);

                // Conflicto por referencias FK
                if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
                    return res.status(409).json({
                        error: 'No se puede eliminar la ciudad porque está referenciada por otros registros'
                    });
                }
                return res.status(500).json({ error: err.message || 'Error eliminando ciudad' });
            }

            // Si el DAO informa que no se afectó ninguna fila
            if (!result || result.affectedRows === 0) {
                return res.status(404).json({ error: 'Ciudad no encontrada' });
            }

            return res.json({ success: true });
        });
    }

    // SEARCH
    search(req, res) {
        const query = req.query.q || '';
        
        if (query.length < 2) {
            return res.json([]);
        }
        
        SACiudad.searchCiudades(query, (err, ciudades) => {
            if (err) {
                console.error('Error in CiudadController.search:', err);
                return res.status(500).json({ error: 'Error searching ciudades' });
            }
            
            const ciudadesJSON = ciudades.map(ciudad => ciudad.toJSON());
            res.json(ciudadesJSON);
        });
    }

    // Obtener conexiones entre ciudades
    getCityConnections(req, res) {
        try {
            SACiudad.getCityConnections((err, connections) => {
                if (err) {
                    console.error('Error obteniendo conexiones de ciudades:', err);
                    return res.status(500).json({ 
                        error: 'Error interno del servidor',
                        details: err.message 
                    });
                }
                res.json(connections || []);
            });
        } catch (error) {
            console.error('Error en getCityConnections:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor',
                details: error.message 
            });
        }
    }
}

module.exports = new CiudadController();