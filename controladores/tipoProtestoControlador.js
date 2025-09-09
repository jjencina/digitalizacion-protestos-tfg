const SATipoProtesto = require('../negocio/SATipoProtesto');

class TipoProtestoController {
    // GET all tipos de protesto
    getAll(req, res) {
        SATipoProtesto.getAllTiposProtesto((err, tipos) => {
            if (err) {
                console.error('Error in TipoProtestoController.getAll:', err);
                return res.status(500).json({ error: 'Error getting tipos de protesto' });
            }
            res.json(tipos);
        });
    }

    // GET tipo de protesto by ID
    getById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SATipoProtesto.getTipoProtestoById(id, (err, tipo) => {
            if (err) {
                console.error('Error in TipoProtestoController.getById:', err);
                return res.status(500).json({ error: 'Error getting tipo de protesto' });
            }
            if (!tipo) {
                return res.status(404).json({ error: 'Tipo de protesto not found' });
            }
            res.json(tipo);
        });
    }

    // CREATE
    create(req, res) {
        const tipoData = {
            nombre: req.body.nombre
        };

        SATipoProtesto.createTipoProtestoFromController(tipoData, (err, tipo) => {
            if (err) {
                console.error('Error in TipoProtestoController.create:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error creating tipo de protesto'
                });
            }
            
            res.status(201).json(tipo);
        });
    }

    // UPDATE
    update(req, res) {
        const id = req.params.id;
        const tipoData = {
            nombre: req.body.nombre
        };

        SATipoProtesto.updateTipoProtesto(id, tipoData, (err, tipo) => {
            if (err) {
                console.error('Error in TipoProtestoController.update:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error updating tipo de protesto'
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

        SATipoProtesto.deleteTipoProtesto(id, (err, result) => {
            if (err) {
                console.error('Error in TipoProtestoController.delete:', err);
                
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({
                        error: 'No se puede eliminar este tipo de protesto porque está siendo utilizado en uno o más protestos'
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error deleting tipo de protesto' 
                });
            }
            res.json(result);
        });
    }

    // SEARCH
    search(req, res) {
        const query = req.query.q || '';
        
        SATipoProtesto.searchTiposProtesto(query, (err, tipos) => {
            if (err) {
                console.error('Error in TipoProtestoController.search:', err);
                return res.status(500).json({ error: 'Error searching tipos de protesto' });
            }
            res.json(tipos);
        });
    }
}

module.exports = new TipoProtestoController();