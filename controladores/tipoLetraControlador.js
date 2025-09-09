const SATipoLetra = require('../negocio/SATipoLetra');

class TipoLetraController {
    // GET all tipos de letra
    getAll(req, res) {
        SATipoLetra.getAllTiposLetra((err, tipos) => {
            if (err) {
                console.error('Error in TipoLetraController.getAll:', err);
                return res.status(500).json({ error: 'Error getting tipos de letra' });
            }
            res.json(tipos);
        });
    }

    // GET tipo de letra by ID
    getById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SATipoLetra.getTipoLetraById(id, (err, tipo) => {
            if (err) {
                console.error('Error in TipoLetraController.getById:', err);
                return res.status(500).json({ error: 'Error getting tipo de letra' });
            }
            if (!tipo) {
                return res.status(404).json({ error: 'Tipo de letra not found' });
            }
            res.json(tipo);
        });
    }

    // CREATE
    create(req, res) {
        const tipoData = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion
        };

        SATipoLetra.createTipoLetraFromController(tipoData, (err, tipo) => {
            if (err) {
                console.error('Error in TipoLetraController.create:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error creating tipo de letra'
                });
            }
            
            res.status(201).json(tipo);
        });
    }

    // UPDATE
    update(req, res) {
        const id = req.params.id;
        const tipoData = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion
        };

        SATipoLetra.updateTipoLetra(id, tipoData, (err, tipo) => {
            if (err) {
                console.error('Error in TipoLetraController.update:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error updating tipo de letra'
                });
            }
            
            res.json(tipo);
        });
    }

    // DELETE
    delete(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SATipoLetra.deleteTipoLetra(id, (err, result) => {
            if (err) {
                console.error('Error in TipoLetraController.delete:', err);
                return res.status(500).json({ 
                    error: err.message || 'Error deleting tipo de letra' 
                });
            }
            res.json(result);
        });
    }

    // SEARCH
    search(req, res) {
        const query = req.query.q || '';
        
        SATipoLetra.searchTiposLetra(query, (err, tipos) => {
            if (err) {
                console.error('Error in TipoLetraController.search:', err);
                return res.status(500).json({ error: 'Error searching tipos de letra' });
            }
            res.json(tipos);
        });
    }
}

module.exports = new TipoLetraController();