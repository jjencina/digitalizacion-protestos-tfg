const SAEndoso = require('../negocio/SAEndoso');

class EndosoController {
    getAll(req, res) {
        SAEndoso.getAllEndosos((err, endosos) => {
            if (err) {
                console.error('Error in EndosoController.getAll:', err);
                return res.status(500).json({ error: 'Error getting endosos' });
            }
            res.json(endosos);
        });
    }

    getById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SAEndoso.getEndosoById(id, (err, endoso) => {
            if (err) {
                console.error('Error in EndosoController.getById:', err);
                return res.status(500).json({ error: 'Error getting endoso' });
            }
            if (!endoso) {
                return res.status(404).json({ error: 'Endoso not found' });
            }
            res.json(endoso);
        });
    }

    create(req, res) {
        const endosoData = {
            fecha_endoso: req.body.fecha_endoso,
            valor: req.body.valor,
            id_moneda: req.body.id_moneda,
            id_tipo_negociacion: req.body.id_tipo_negociacion,
            id_ciudad: req.body.id_ciudad,
            id_tipo_valor: req.body.id_tipo_valor, 
            comentarios: req.body.comentarios
        };

        SAEndoso.createEndoso(endosoData, (err, result) => {
            if (err) {
                console.error('Error in EndosoController.create:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error creating endoso'
                });
            }
            
            res.status(201).json(result);
        });
    }

    update(req, res) {
        const id = req.params.id;
        const endosoData = {
            fecha_endoso: req.body.fecha_endoso,
            valor: req.body.valor,
            id_moneda: req.body.id_moneda,
            id_tipo_negociacion: req.body.id_tipo_negociacion,
            id_ciudad: req.body.id_ciudad,
            id_tipo_valor: req.body.id_tipo_valor,
            comentarios: req.body.comentarios
        };

        SAEndoso.updateEndoso(id, endosoData, (err, result) => {
            if (err) {
                console.error('Error in EndosoController.update:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error updating endoso'
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

        SAEndoso.deleteEndoso(id, (err, result) => {
            if (err) {
                console.error('Error in EndosoController.delete:', err);
                
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({
                        error: 'No se puede eliminar este endoso porque está siendo utilizado en relaciones con letras'
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error deleting endoso' 
                });
            }
            res.json(result);
        });
    }

    getTiposNegociacion(req, res) {
        SAEndoso.getTiposNegociacion((err, tipos) => {
            if (err) {
                console.error('Error getting tipos negociacion:', err);
                return res.status(500).json({ error: 'Error getting tipos negociacion' });
            }
            res.json(tipos);
        });
    }
}

module.exports = new EndosoController();