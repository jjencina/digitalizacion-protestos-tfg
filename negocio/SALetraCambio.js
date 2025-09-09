const DAOLetra = require('../integracion/DAOLetraCambio');
const DAOTipoLetra = require('../integracion/DAOTipoLetra');
const DAOLetraEndosos = require('../integracion/DAOLetraEndosos');

class SALetraCambio {
    createLetra(letraData, callback) {
        const errors = this.validateLetraData(letraData);
        if (errors.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errors 
            });
        }
        
        DAOLetra.create(letraData, callback);
    }

    updateLetra(id, letraData, callback) {r
        const errors = this.validateLetraData(letraData);
        if (errors.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errors 
            });
        }
        
        DAOLetra.update(id, letraData, callback);
    }

    deleteLetra(id, callback) {
        DAOLetra.delete(id, callback);
    }

    getAllLetras(callback) {
        DAOLetra.getAll(callback);
    }

    getLetraById(id, callback) {
        DAOLetra.getById(id, callback);
    }

    validateLetraData(letraData) {
        const errors = [];
        
        // Validar fecha de emisión
        if (!letraData.fecha_letra || !letraData.fecha_letra.trim()) {
            errors.push('La fecha de emisión es obligatoria');
        } else {
            const fecha = new Date(letraData.fecha_letra);
            if (isNaN(fecha.getTime())) {
                errors.push('La fecha de emisión no es válida');
            }
        }
        // Validar importe
        if (!letraData.importe) {
            errors.push('El importe de la letra es obligatorio');
        } else {
            const importe = parseFloat(letraData.importe);
            if (isNaN(importe) || importe <= 0) {
                errors.push('El importe debe ser un número mayor que cero');
            }
        }    
        // Validar moneda
        if (!letraData.id_moneda) {
            errors.push('La moneda es obligatoria');
        }    
        // Validar tipo de letra
        if (!letraData.id_tipo_letra) {
            errors.push('El tipo de letra es obligatorio');
        }      
        // Solo verificamos que sea un string si se proporciona
        if (letraData.fecha_vencimiento && typeof letraData.fecha_vencimiento !== 'string') {
            errors.push('El vencimiento debe ser texto');
        }
        
        return errors;
    }

    getTiposLetra(callback) {
        DAOTipoLetra.getAll(callback);
    }

    getTiposValor(callback) {
        DAOLetra.getTiposValor(callback);
    }

    getTiposPlazo(callback) {
        DAOLetra.getTiposPlazo(callback);
    }

    searchTiposLetra(query, callback) {
        DAOTipoLetra.search(query, callback);
    }

    // Métodos para relaciones letra-endoso
    getAllRelacionesEndosos(callback) {
        DAOLetraEndosos.getAll(callback);
    }

    getRelacionEndosoById(id, callback) {
        DAOLetraEndosos.getById(id, callback);
    }

    createRelacionEndoso(data, callback) {
        DAOLetraEndosos.create(data, callback);
    }

    updateRelacionEndoso(id, data, callback) {
        DAOLetraEndosos.update(id, data, callback);
    }

    deleteRelacionEndoso(id, callback) {
        DAOLetraEndosos.delete(id, callback);
    }

    getEndososByLetra(letraId, callback) {
        DAOLetraEndosos.getEndososByLetra(letraId, callback);
    }

    getLetrasByEndoso(endosoId, callback) {
        DAOLetraEndosos.getLetrasByEndoso(endosoId, callback);
    }
    
}

module.exports = new SALetraCambio();