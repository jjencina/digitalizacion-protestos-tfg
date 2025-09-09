const DAOEndoso = require('../integracion/DAOEndoso');

class SAEndoso {
    createEndoso(endosoData, callback) {
        const errors = this.validateEndosoData(endosoData);
        if (errors.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errors 
            });
        }
        
        DAOEndoso.create(endosoData, callback);
    }

    getAllEndosos(callback) {
        DAOEndoso.getAll(callback);
    }

    getEndosoById(id, callback) {
        DAOEndoso.getById(id, callback);
    }

    updateEndoso(id, endosoData, callback) {
        const errors = this.validateEndosoData(endosoData);
        if (errors.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errors 
            });
        }
        
        DAOEndoso.update(id, endosoData, callback);
    }

    deleteEndoso(id, callback) {
        DAOEndoso.delete(id, callback);
    }

    getTiposNegociacion(callback) {
        DAOEndoso.getTiposNegociacion(callback);
    }

    validateEndosoData(endosoData) {
        const errors = [];
        
        // Validar fecha de endoso
        if (!endosoData.fecha_endoso || !endosoData.fecha_endoso.trim()) {
            errors.push('La fecha de endoso es obligatoria');
        } else {
            const fecha = new Date(endosoData.fecha_endoso);
            if (isNaN(fecha.getTime())) {
                errors.push('La fecha de endoso no es válida');
            }
        }
        // Validar valor
        if (!endosoData.valor) {
            errors.push('El valor del endoso es obligatorio');
        } else {
            const valor = parseFloat(endosoData.valor);
            if (isNaN(valor) || valor <= 0) {
                errors.push('El valor del endoso debe ser un número mayor que cero');
            }
        }     
        // Validar moneda
        if (!endosoData.id_moneda) {
            errors.push('La moneda es obligatoria');
        }     
        // Validar tipo de negociación
        if (!endosoData.id_tipo_negociacion) {
            errors.push('El tipo de negociación es obligatorio');
        }
        
        return errors;
    }

    validateRoles(roles) {
        return Array.isArray(roles) && 
               roles.every(rol => 
                   rol.id_rol && 
                   rol.id_persona
               );
    }
}

module.exports = new SAEndoso();