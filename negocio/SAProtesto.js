const DAOProtesto = require('../integracion/DAOProtesto');
const DAOTipoProtesto = require('../integracion/DAOTipoProtesto');
const DAOPersona = require('../integracion/DAOPersona');
const DAOProtestoLetras = require('../integracion/DAOProtestoLetras');

class SAProtesto {

    createProtesto(protestoData, callback) {
        const errors = this.validateBasicProtestoData(protestoData);
        if (errors.length > 0) {
            return callback({
                message: 'Errores de validación',
                errores: errors
            });
        }

        DAOProtesto.create(protestoData, callback);
    }

    updateProtesto(id, protestoData, callback) {
        const errors = this.validateBasicProtestoData(protestoData);
        if (errors.length > 0) {
            return callback({
                message: 'Errores de validación',
                errores: errors
            });
        }

        DAOProtesto.update(id, protestoData, callback);
    }

    validateBasicProtestoData(data) {
        const errors = [];   
        if (!data.fecha_protesto) {
            errors.push('La fecha de protesto es obligatoria');
        }        
        if (data.archivo && data.archivo.length > 255) {
            errors.push('El archivo no puede exceder 255 caracteres');
        }        
        if (data.protocolo && data.protocolo.length > 100) {
            errors.push('El protocolo no puede exceder 100 caracteres');
        }        
        if (data.pagina && data.pagina.length > 50) {
            errors.push('La página no puede exceder 50 caracteres');
        }

        return errors;
    }

    createProtesto(protestoData, callback) {
        this.processProtestoData(protestoData, (err, processedData) => {
            if (err) {
                callback(err);
                return;
            }

            console.log("Datos antes de ser prcesados", protestoData);

            // Iniciar transaction en DAO
            DAOProtesto.create(processedData.protesto, (err, protestoResult) => {
                if (err) {
                    console.error('Error creating protesto:', err);
                    return callback(err);
                }

                const protestoId = protestoResult.insertId;

                // Procesar roles con personas ya creadas
                if (processedData.roles && processedData.roles.length > 0) {
                    const validRoles = processedData.roles.filter(rol => 
                        rol && 
                        rol.id_rol && 
                        rol.id_persona && 
                        (rol.id_ciudad === null || rol.id_ciudad)
                    );

                    this.insertProtestoRoles(protestoId, validRoles, (err) => {
                        if (err) {
                            console.error('Error creating protesto roles:', err);
                            return callback(err);
                        }

                        // Si tiene letras las insertamos
                        if (processedData.letras && processedData.letras.length > 0) {
                            this.insertLetras(protestoId, processedData.letras, callback);
                        } else {
                            callback(null, { success: true, protestoId });
                        }
                    });
                } else {
                    callback(null, { success: true, protestoId });
                }
            });
        });
    }

    insertProtestoRoles(protestoId, roles, callback) {
        let processed = 0;
        let errors = [];
    
        roles.forEach(rol => {
            // Primero procesamos la persona si es necesario 
            this.processPersonaValue(rol.id_persona, (err, result) => {
                if (err) {
                    errors.push(err);
                    processed++;
                    if (processed === roles.length) {
                        if (errors.length > 0) {
                            callback(errors[0]);
                        } else {
                            callback(null);
                        }
                    }
                    return;
                }
    
                // Actualizamos el id_persona con el resultado 
                if (result) {
                    rol.id_persona = result;
                }
    
                // Luego insertamos el rol
                DAOProtesto.insertProtestoRol(protestoId, rol, (err) => {
                    processed++;
                    if (err) {
                        errors.push(err);
                    }
    
                    if (processed === roles.length) {
                        if (errors.length > 0) {
                            callback(errors[0]); 
                        } else {
                            callback(null);
                        }
                    }
                });
            });
        });
    }

    insertLetras(protestoId, letras, callback) {
        let processed = 0;
        let errors = [];

        letras.forEach(letra => {
            DAOProtesto.insertLetra(letra, (err, letraResult) => {
                if (err) {
                    errors.push(err);
                    processed++;
                } else {
                    const letraId = letraResult.insertId;
                    this.handleLetraRelations(protestoId, letraId, letra, (err) => {
                        processed++;
                        if (err) errors.push(err);

                        if (processed === letras.length) {
                            if (errors.length > 0) {
                                callback(errors[0]);
                            } else {
                                callback(null, { success: true, protestoId });
                            }
                        }
                    });
                }
            });
        });
    }

    handleLetraRelations(protestoId, letraId, letra, callback) {
        DAOProtesto.insertProtestoLetra(protestoId, letraId, (err) => {
            if (err) return callback(err);

            if (letra.roles) {
                this.insertLetraRoles(letraId, letra.roles, (err) => {
                    if (err) return callback(err);

                    if (letra.endosos) {
                        this.insertEndosos(letraId, letra.endosos, callback);
                    } else {
                        callback(null);
                    }
                });
            } else {
                callback(null);
            }
        });
    }

    validateProtestoData(data) {
        return data && 
               data.protesto && 
               data.protesto.fecha_protesto &&
               data.protesto.importe &&
               data.protesto.id_moneda &&
               data.protesto.motivo;
    }

    deleteProtesto(id, callback) {
        if (!id) {
            return callback(new Error('ID is required'));
        }

        try {
            DAOProtesto.delete(id, (err, result) => {
                if (err) {
                    console.error('Error en SAProtesto.deleteProtesto:', err);
                    return callback(err);
                }
                callback(null, result);
            });
        } catch (error) {
            console.error('Error en SAProtesto.deleteProtesto:', error);
            callback(error);
        }
    }

    searchTiposProtesto(query, callback) {
        SATipoProtesto.searchTiposProtesto(query, callback);
    }

    getTiposProtesto(callback) {
        SATipoProtesto.getAllTiposProtesto(callback);
    }

    deleteTipoProtesto(id, callback) {
        SATipoProtesto.deleteTipoProtesto(id, callback);
    }

    //-------- Funciones de crear protesto --------------
    processPersonaValue(personaValue, callback) {
        console.log("processPersonaValue - Input:", personaValue, typeof personaValue);
        
        // Si es un número, devolver el ID
        if (!isNaN(personaValue)) {
            const id = parseInt(personaValue);
            console.log("processPersonaValue - Numeric ID:", id, typeof id);
            callback(null, id);
            return;
        }
        // Si es un string, crear nueva persona y devolver su ID
        if (typeof personaValue === 'string' && personaValue.trim()) {
            const personaData = {
                nombre: personaValue.trim(),
                apellidos: '',
                pais: ''
            };
    
            console.log("processPersonaValue - Creating person:", personaData);
            DAOPersona.create(personaData, (err, result) => {
                if (err) {
                    console.error('Error creating new persona:', err);
                    return callback(err);
                }
                console.log("processPersonaValue - Created person result:", result);
                console.log("processPersonaValue - New ID:", result.insertId, typeof result.insertId);
                callback(null, result.insertId);
            });
            return;
        }
    
        console.log("processPersonaValue - No match, returning null");
        callback(null, null);
    }

    insertProtestoRoles(protestoId, roles, callback) {
        console.log("insertProtestoRoles - Roles to insert:", JSON.stringify(roles));
        let processed = 0;
        let errors = [];
    
        roles.forEach((rol, index) => {
            console.log(`Role ${index} id_persona:`, rol.id_persona, typeof rol.id_persona);
            
            // Primero procesamos la persona si es necesario
            this.processPersonaValue(rol.id_persona, (err, result) => {
                if (err) {
                    console.error("processPersonaValue error:", err);
                    errors.push(err);
                    processed++;
                    if (processed === roles.length) {
                        if (errors.length > 0) {
                            callback(errors[0]);
                        } else {
                            callback(null);
                        }
                    }
                    return;
                }
    
                console.log(`Role ${index} processPersonaValue result:`, result, typeof result);
                
                // Actualizamos el id_persona directamente con el resultado
                if (result) {
                    rol.id_persona = result;
                    console.log(`Role ${index} updated id_persona:`, rol.id_persona, typeof rol.id_persona);
                }
    
                // Luego insertamos el rol
                console.log(`Inserting role ${index}:`, JSON.stringify(rol));
                DAOProtesto.insertProtestoRol(protestoId, rol, (err) => {
                    processed++;
                    if (err) {
                        console.error(`Error inserting role ${index}:`, err);
                        errors.push(err);
                    }
    
                    if (processed === roles.length) {
                        if (errors.length > 0) {
                            callback(errors[0]);
                        } else {
                            callback(null);
                        }
                    }
                });
            });
        });
        // Si no hay roles, llamar a callback
        if (roles.length === 0) {
            callback(null);
        }
    }

    //-------- Funciones para la relacion protesto letra
    getAllRelacionesProtestos(callback) {
        DAOProtestoLetras.getAll(callback);
    }

    getRelacionProtestoById(id, callback) {
        DAOProtestoLetras.getById(id, callback);
    }

    createRelacionProtesto(data, callback) {
        DAOProtestoLetras.create(data, callback);
    }

    updateRelacionProtesto(id, data, callback) {
        DAOProtestoLetras.update(id, data, callback);
    }

    deleteRelacionProtesto(id, callback) {
        DAOProtestoLetras.delete(id, callback);
    }

    getLetrasByProtesto(protestoId, callback) {
        DAOProtestoLetras.getLetrasByProtesto(protestoId, callback);
    }

    getProtestosByLetra(letraId, callback) {
        DAOProtestoLetras.getProtestosByLetra(letraId, callback);
    }

    deleteTipoProtesto(id, callback) {
        SATipoProtesto.deleteTipoProtesto(id, callback);
    }

    getProtestoById(id, callback) {
        if (!id) return callback(new Error('ID requerido'));
        DAOProtesto.getById(id, callback);
    }

    getAllProtestos(callback) {
        DAOProtesto.getAll(callback);
    }
}

module.exports = new SAProtesto();