const DAOTipoLetra = require('../integracion/DAOTipoLetra');

class SATipoLetra {

    processTipoLetraFields(data, fields, callback) {
        let pendingOperations = 0;
        let hasError = false;

        const processField = (field) => {
            if (data[field] && typeof data[field] === 'string' && isNaN(data[field])) {
                pendingOperations++;
                this.createTipoLetra(data[field], (err, tipoId) => {
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

    createTipoLetra(nombre, callback) {
        if (!isNaN(nombre)) {
            return callback(null, parseInt(nombre));
        }
        
        const tipoNombre = nombre.trim();       
        // Verificar si ya existe un tipo letra con este nombre
        DAOTipoLetra.findByName(tipoNombre, (err, existingTipo) => {
            if (err) {
                console.error('Error buscando tipo letra existente:', err);
                return callback(err);
            }
            
            // Si ya existe, return su ID
            if (existingTipo) {
                console.log('Tipo letra existente encontrado:', existingTipo);
                return callback(null, existingTipo.id_tipo_letra);
            }
            
            // Si no existe, crear uno nuevo
            const tipoData = {
                nombre: tipoNombre,
                descripcion: null
            };
            
            DAOTipoLetra.create(tipoData, (err, result) => {
                if (err) {
                    console.error('Error creando tipo letra:', err);
                    return callback(err);
                }
                
                console.log('Nuevo tipo letra creado:', result);
                callback(null, result.id_tipo_letra);
            });
        });
    }

    createTipoLetraFromController(tipoData, callback) {
        // Si es un string nombre usar el método existente
        if (typeof tipoData === 'string') {
            return this.createTipoLetra(tipoData, callback);
        }
        // Si es un objeto con datos completos, validar y crear
        const { nombre, descripcion } = tipoData;
        
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
        
        DAOTipoLetra.create({ nombre: nombre.trim(), descripcion }, callback);
    }

    updateTipoLetra(id, tipoData, callback) {
        const { nombre, descripcion } = tipoData;
        
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
        
        DAOTipoLetra.update(id, { nombre: nombre.trim(), descripcion }, callback);
    }

    deleteTipoLetra(id, callback) {
        DAOTipoLetra.delete(id, callback);
    }

    getTipoLetraById(id, callback) {
        DAOTipoLetra.getById(id, callback);
    }

    getAllTiposLetra(callback) {
        DAOTipoLetra.getAll(callback);
    }

    searchTiposLetra(query, callback) {
        DAOTipoLetra.search(query, callback);
    }
}

module.exports = new SATipoLetra();