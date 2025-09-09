const SAMoneda = require('../negocio/SAMoneda');
const Moneda = require('../entidades/Moneda');

class MonedaController {
    // GET all monedas
    getAll(req, res) {
        SAMoneda.getAllMonedas((err, monedas) => {
            if (err) {
                console.error('Error in MonedaController.getAll:', err);
                return res.status(500).json({ error: 'Error getting monedas' });
            }
            
            const monedasJSON = monedas.map(moneda => moneda.toJSON());
            res.json(monedasJSON);
        });
    }

    // GET moneda by ID
    getById(req, res) {
        const id = req.params.id;
        SAMoneda.getMonedaById(id, (err, moneda) => {
            if (err) {
                console.error('Error in MonedaController.getById:', err);
                return res.status(500).json({ error: 'Error getting moneda' });
            }
            if (!moneda) {
                return res.status(404).json({ error: 'Moneda not found' });
            }
            
            res.json(moneda.toJSON());
        });
    }

    // CREATE
    create(req, res) {
        const nombre = (req.body.nombre_moneda || req.body.nombre || '').trim();
        if (!nombre) {
            return res.status(400).json({ error: 'Nombre de moneda requerido' });
        }
        SAMoneda.createOrGet(nombre, (err, moneda) => {
            if (err) {
                console.error('Error creando/obteniendo moneda:', err);
                return res.status(500).json({ error: 'Error al guardar la moneda' });
            }
            res.json(moneda);
        });
    }

    // UPDATE moneda
    update(req, res) {
        const id = req.params.id;
        const monedaData = {
            nombre_moneda: req.body.nombre_moneda
        };

        SAMoneda.updateMoneda(id, monedaData, (err, moneda) => {
            if (err) {
                console.error('Error in MonedaController.update:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error updating moneda'
                });
            }
            
            res.json(moneda.toJSON());
        });
    }

    // DELETE moneda
    delete(req, res) {
        const id = req.params.id;
        SAMoneda.deleteMoneda(id, (err, result) => {
            if (err) {
                console.error('Error in MonedaController.delete:', err);
                return res.status(500).json({ error: err.message || 'Error deleting moneda' });
            }
            res.json(result);
        });
    }

    // SEARCH monedas
    search(req, res) {
        const query = req.query.q || '';
        
        SAMoneda.searchMonedas(query, (err, monedas) => {
            if (err) {
                console.error('Error in MonedaController.search:', err);
                return res.status(500).json({ error: 'Error searching monedas' });
            }
            
            const monedasJSON = monedas.map(moneda => moneda.toJSON());
            res.json(monedasJSON);
        });
    }
}

module.exports = new MonedaController();