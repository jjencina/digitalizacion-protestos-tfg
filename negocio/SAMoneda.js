const DAOMoneda = require('../integracion/DAOMoneda');
const Moneda = require('../entidades/Moneda');

class SAMoneda {

    processMonedaFields(data, fields, callback) {
        let pendingOperations = 0;
        let hasError = false;

        const processField = (field) => {
            if (data[field] && typeof data[field] === 'string' && isNaN(data[field])) {
                pendingOperations++;
                this.createMoneda(data[field], (err, monedaId) => {
                    if (hasError) return;
                    
                    if (err) {
                        hasError = true;
                        return callback(err);
                    }
                    
                    console.log(`Campo ${field} procesado: ${data[field]} -> ${monedaId}`);
                    data[field] = monedaId;
                    
                    pendingOperations--;
                    if (pendingOperations === 0) {
                        callback(null, data);
                    }
                });
            }
        };

        fields.forEach(processField);
        
        if (pendingOperations === 0) {
            callback(null, data);
        }
    }

    createMonedaFromController(monedaData, callback) {
        // Si es un string (nombre), usar el método existente para nombres
        if (typeof monedaData === 'string') {
            return this.createMoneda(monedaData, callback);
        }
        
        // Si es un objeto con datos completos, validar y crear
        const moneda = new Moneda(monedaData);
        const errores = moneda.validar();
        
        if (errores.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errores 
            });
        }
        
        DAOMoneda.create(moneda, callback);
    }

    updateMoneda(id, monedaData, callback) {
        const moneda = new Moneda(monedaData);
        const errores = moneda.validar();
        
        if (errores.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errores 
            });
        }
        
        DAOMoneda.update(id, moneda, callback);
    }

    deleteMoneda(id, callback) {
        DAOMoneda.delete(id, callback);
    }

    createMoneda(nombre, callback) {
        if (!isNaN(nombre)) {
            return callback(null, parseInt(nombre));
        }
        
        const moneda = Moneda.fromNombre(nombre);
        
        DAOMoneda.create(moneda, (err, monedaCreada) => {
            if (err) {
                console.error('Error creando moneda:', err);
                return callback(err);
            }
            
            console.log('Nueva moneda creada:', monedaCreada.toJSON());
            callback(null, monedaCreada.id_moneda);
        });
    }

    getAllMonedas(callback) {
        DAOMoneda.getAll(callback);
    }

    searchMonedas(nombre, callback) {
        DAOMoneda.searchByName(nombre, callback);
    }

    getMonedaById(id, callback) {
        DAOMoneda.getById(id, callback);
    }

    createOrGet(nombre, cb) {
        DAOMoneda.createOrGetByName(nombre, cb);
    }
}
module.exports = new SAMoneda();