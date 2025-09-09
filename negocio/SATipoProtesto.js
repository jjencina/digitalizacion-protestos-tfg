const DAOTipoProtesto = require('../integracion/DAOTipoProtesto');

class SATipoProtesto {

    processTipoProtestoFields(data, fields, callback) {
        let pendingOperations = 0;
        let hasError = false;

        const processField = (field) => {
            if (data[field] && typeof data[field] === 'string' && isNaN(data[field])) {
                pendingOperations++;
                this.createTipoProtesto(data[field], (err, tipoId) => {
                    if (hasError) return;
                    
                    if (err) {
                        hasError = true;
                        return callback(err);
                    }
                    
                    console.log(`Campo ${field} procesado: ${data[field]} -> ${tipoId}`);
                    data[field] = tipoId;
                    
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

    createTipoProtesto(nombre, callback) {
        if (!isNaN(nombre)) {
            return callback(null, parseInt(nombre));
        }
        
        const tipoNombre = nombre.trim();       
        // Verificar si ya existe un tipo protesto con este nombre
        DAOTipoProtesto.findByName(tipoNombre, (err, existingTipo) => {
            if (err) {
                console.error('Error buscando tipo protesto existente:', err);
                return callback(err);
            }
            
            // Si ya existe, return ID
            if (existingTipo) {
                console.log('Tipo protesto existente encontrado:', existingTipo);
                return callback(null, existingTipo.id_tipo_protesto);
            }
            
            // Si no existe, crear uno nuevo
            const tipoData = {
                nombre: tipoNombre
            };
            
            DAOTipoProtesto.create(tipoData, (err, result) => {
                if (err) {
                    console.error('Error creando tipo protesto:', err);
                    return callback(err);
                }
                
                console.log('Nuevo tipo protesto creado:', result);
                callback(null, result.id_tipo_protesto);
            });
        });
    }

    createTipoProtestoFromController(tipoData, callback) {
        // Si es un string nombre, usar el método existente
        if (typeof tipoData === 'string') {
            return this.createTipoProtesto(tipoData, callback);
        }
        
        // Si es un objeto con datos completos, validar y crear
        const { nombre } = tipoData;
        
        if (!nombre || !nombre.trim()) {
            return callback({ 
                message: 'Errores de validación', 
                errores: ['El nombre es obligatorio'] 
            });
        }
        
        if (nombre.length > 100) {
            return callback({ 
                message: 'Errores de validación', 
                errores: ['El nombre no puede exceder 100 caracteres'] 
            });
        }
        
        // Verificar si ya existe un tipo protesto con este nombre
        DAOTipoProtesto.findByName(nombre.trim(), (err, existingTipo) => {
            if (err) {
                console.error('Error buscando tipo protesto existente:', err);
                return callback(err);
            }
            
            // Si ya existe, return error
            if (existingTipo) {
                return callback({ 
                    message: 'Errores de validación', 
                    errores: ['Ya existe un tipo de protesto con este nombre'] 
                });
            }
            
            // Si no existe, crear uno nuevo
            const tipoDataToCreate = {
                nombre: nombre.trim()
            };
            
            DAOTipoProtesto.create(tipoDataToCreate, callback);
        });
    }


    updateTipoProtesto(id, tipoData, callback) {
        const { nombre } = tipoData;
        
        if (!nombre || !nombre.trim()) {
            return callback({ 
                message: 'Errores de validación', 
                errores: ['El nombre es obligatorio'] 
            });
        }
        
        if (nombre.length > 100) {
            return callback({ 
                message: 'Errores de validación', 
                errores: ['El nombre no puede exceder 100 caracteres'] 
            });
        }
        
        // Verificar si ya existe otro tipo protesto con este nombre
        DAOTipoProtesto.findByName(nombre.trim(), (err, existingTipo) => {
            if (err) {
                console.error('Error buscando tipo protesto existente:', err);
                return callback(err);
            }
            
            // Si existe y no es el mismo que estamos actualizando, retornar error
            if (existingTipo && existingTipo.id_tipo_protesto != id) {
                return callback({ 
                    message: 'Errores de validación', 
                    errores: ['Ya existe un tipo de protesto con este nombre'] 
                });
            }
            
            const updateData = {
                nombre: nombre.trim()
            };
            
            DAOTipoProtesto.update(id, updateData, callback);
        });
    }

    deleteTipoProtesto(id, callback) {
        DAOTipoProtesto.delete(id, callback);
    }

    searchTiposProtesto(query, callback) {
        DAOTipoProtesto.search(query, callback);
    }

    getAllTiposProtesto(callback) {
        DAOTipoProtesto.getAll(callback);
    }

    findByName(nombre, callback) {
        DAOTipoProtesto.findByName(nombre, callback);
    }

    getTipoProtestoById(id, callback) {
        DAOTipoProtesto.getById(id, callback);
    }
}

module.exports = new SATipoProtesto();