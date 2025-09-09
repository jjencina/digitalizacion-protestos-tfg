const SALetra = require('../negocio/SALetraCambio');

class LetraCambioController {
    getAll(req, res) {
        SALetra.getAllLetras((err, letras) => {
            if (err) {
                console.error('Error in LetraController.getAll:', err);
                return res.status(500).json({ error: 'Error getAll letras' });
            }
            res.json(letras);
        });
    }

    getById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SALetra.getLetraById(id, (err, letra) => {
            if (err) {
                console.error('Error in LetraController.getById:', err);
                return res.status(500).json({ error: 'Error getting letra' });
            }
            if (!letra) {
                return res.status(404).json({ error: 'Letra not found' });
            }
            res.json(letra);
        });
    }

    create(req, res) {
        const letraData = {
            fecha_letra: req.body.fecha_letra,
            fecha_vencimiento: req.body.fecha_vencimiento,
            importe: req.body.importe,
            id_moneda: req.body.id_moneda,
            id_tipo_letra: req.body.id_tipo_letra,
            id_tipo_plazo: req.body.id_tipo_plazo,
            id_tipo_valor: req.body.id_tipo_valor,
            id_ciudad: req.body.id_ciudad,
            texto_indicacion: req.body.texto_indicacion,
            plazo_dias: req.body.plazo_dias,
            comentarios: req.body.comentarios,
            uso: req.body.uso
        };

        SALetra.createLetra(letraData, (err, result) => {
            if (err) {
                console.error('Error in LetraController.create:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error creating letra'
                });
            }
            
            res.status(201).json(result);
        });
    }

    update(req, res) {
        const id = req.params.id;
        const letraData = {
            fecha_letra: req.body.fecha_letra,
            fecha_vencimiento: req.body.fecha_vencimiento,
            importe: req.body.importe,
            id_moneda: req.body.id_moneda,
            id_tipo_letra: req.body.id_tipo_letra,
            id_tipo_plazo: req.body.id_tipo_plazo,
            id_tipo_valor: req.body.id_tipo_valor,
            id_ciudad: req.body.id_ciudad,
            texto_indicacion: req.body.texto_indicacion,
            plazo_dias: req.body.plazo_dias,
            comentarios: req.body.comentarios,
            uso: req.body.uso
        };

        SALetra.updateLetra(id, letraData, (err, result) => {
            if (err) {
                console.error('Error in LetraController.update:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error updating letra'
                });
            }
            
            res.json(result);
        });
    }

    delete(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SALetra.deleteLetra(id, (err, result) => {
            if (err) {
                console.error('Error in LetraController.delete:', err);
                
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({
                        error: 'No se puede eliminar esta letra porque está siendo utilizada en protestos o endosos'
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error deleting letra' 
                });
            }
            res.json(result);
        });
    }

    getTiposLetra(req, res) {
        SALetra.getTiposLetra((err, tipos) => {
            if (err) {
                console.error('Error getting tipos letra:', err);
                return res.status(500).json({error: 'Error loading tipos letra'});
            }
            res.json(tipos);
        });
    }
    
    getTiposValor(req, res) {
        SALetra.getTiposValor((err, tipos) => {
            if (err) {
                console.error('Error getting tipos valor:', err);
                return res.status(500).json({ error: 'Error getting tipos valor' });
            }
            res.json(tipos);
        });
    }
    
    getTiposPlazo(req, res) {
        SALetra.getTiposPlazo((err, tipos) => {
            if (err) {
                console.error('Error getting tipos plazo:', err);
                return res.status(500).json({ error: 'Error getting tipos plazo' });
            }
            res.json(tipos);
        });
    }

    searchTiposLetra(req, res) {
        const query = req.query.q || '';
        
        SALetra.searchTiposLetra(query, (err, tipos) => {
            if (err) {
                console.error('Error searching tipos letra:', err);
                return res.status(500).json({ error: 'Error searching tipos letra' });
            }
            res.json(tipos);
        });
    }

    // Métodos para relaciones letra-endoso
    getAllRelacionesEndosos(req, res) {
        SALetra.getAllRelacionesEndosos((err, relaciones) => {
            if (err) {
                console.error('Error in LetraController.getAllRelacionesEndosos:', err);
                return res.status(500).json({ error: 'Error getting relaciones' });
            }
            res.json(relaciones);
        });
    }

    getRelacionEndosoById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SALetra.getRelacionEndosoById(id, (err, relacion) => {
            if (err) {
                console.error('Error in LetraController.getRelacionEndosoById:', err);
                return res.status(500).json({ error: 'Error getting relacion' });
            }
            if (!relacion) {
                return res.status(404).json({ error: 'Relación not found' });
            }
            res.json(relacion);
        });
    }

    createRelacionEndoso(req, res) {
        const { id_letra, id_endoso } = req.body;

        if (!id_letra || !id_endoso) {
            return res.status(400).json({ error: 'Letra ID and Endoso ID are required' });
        }

        SALetra.createRelacionEndoso(req.body, (err, result) => {
            if (err) {
                console.error('Error in LetraController.createRelacionEndoso:', err);
                return res.status(500).json({ error: 'Error creating relacion', message: err.message });
            }
            res.status(201).json(result);
        });
    }

    updateRelacionEndoso(req, res) {
        const id = req.body.id_relacion;
        if (!id) {
            return res.status(400).json({ error: 'Relation ID is required' });
        }

        const { id_letra, id_endoso } = req.body;
        if (!id_letra || !id_endoso) {
            return res.status(400).json({ error: 'Letra ID and Endoso ID are required' });
        }

        SALetra.updateRelacionEndoso(id, req.body, (err, result) => {
            if (err) {
                console.error('Error in LetraController.updateRelacionEndoso:', err);
                return res.status(500).json({ error: 'Error updating relacion', message: err.message });
            }
            res.json(result);
        });
    }

    deleteRelacionEndoso(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SALetra.deleteRelacionEndoso(id, (err, result) => {
            if (err) {
                console.error('Error in LetraController.deleteRelacionEndoso:', err);
                return res.status(500).json({ error: 'Error deleting relacion', message: err.message });
            }
            res.json(result);
        });
    }

    getEndososByLetra(req, res) {
        const letraId = req.params.letraId;
        if (!letraId) {
            return res.status(400).json({ error: 'Letra ID is required' });
        }

        SALetra.getEndososByLetra(letraId, (err, endosos) => {
            if (err) {
                console.error('Error in LetraController.getEndososByLetra:', err);
                return res.status(500).json({ error: 'Error getting endosos' });
            }
            res.json(endosos);
        });
    }

    getLetrasByEndoso(req, res) {
        const endosoId = req.params.endosoId;
        if (!endosoId) {
            return res.status(400).json({ error: 'Endoso ID is required' });
        }

        SALetra.getLetrasByEndoso(endosoId, (err, letras) => {
            if (err) {
                console.error('Error in LetraController.getLetrasByEndoso:', err);
                return res.status(500).json({ error: 'Error getting letras' });
            }
            res.json(letras);
        });
    }
}

module.exports = new LetraCambioController();