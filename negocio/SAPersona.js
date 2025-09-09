const DAOPersona = require('../integracion/DAOPersona');
const Persona = require('../entidades/Persona');

class SAPersona {

    processPersonaFields(data, fields, callback) {
        let pendingOperations = 0;
        let hasError = false;

        const processField = (field) => {
            if (data[field] && typeof data[field] === 'string' && isNaN(data[field])) {
                pendingOperations++;
                this.createPersonaFromName(data[field], (err, personaId) => {
                    if (hasError) return;
                    
                    if (err) {
                        hasError = true;
                        return callback(err);
                    }
                    
                    console.log(`Campo ${field} procesado: ${data[field]} -> ${personaId}`);
                    data[field] = personaId;
                    
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

    processRolesPersonas(roles, context, callback) {
        if (!roles || !roles.length) {
            return callback(null, roles);
        }

        let pendingOperations = 0;
        let hasError = false;

        roles.forEach((rol, index) => {
            // Procesar por ID
            if (rol.id_persona && typeof rol.id_persona === 'string' && isNaN(rol.id_persona)) {
                pendingOperations++;
                this.createPersonaFromName(rol.id_persona, (err, personaId) => {
                    if (hasError) return;
                    
                    if (err) {
                        hasError = true;
                        return callback(err);
                    }
                    
                    console.log(`${context} rol[${index}] persona procesada: ${rol.id_persona} -> ${personaId}`);
                    roles[index].id_persona = personaId;
                    
                    pendingOperations--;
                    if (pendingOperations === 0) {
                        callback(null, roles);
                    }
                });
            }
            
            // Procesar por nombre si no hay ID
            if (rol.persona_nombre && (!rol.id_persona || rol.id_persona === null)) {
                pendingOperations++;
                this.createPersonaFromName(rol.persona_nombre, (err, personaId) => {
                    if (hasError) return;
                    
                    if (err) {
                        hasError = true;
                        return callback(err);
                    }
                    
                    console.log(`${context} rol[${index}] persona procesada: ${rol.persona_nombre} -> ${personaId}`);
                    roles[index].id_persona = personaId;
                    
                    pendingOperations--;
                    if (pendingOperations === 0) {
                        callback(null, roles);
                    }
                });
            }
        });

        if (pendingOperations === 0) {
            callback(null, roles);
        }
    }

    createPersona(personaData, callback) {
        // Si es un string nombre usar el método existente
        if (typeof personaData === 'string') {
            return this.createPersonaFromName(personaData, callback);
        }
        
        // Si es un objeto con datos completos, validar y crear
        const persona = new Persona(personaData);
        const errores = persona.validar();
        
        if (errores.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errores 
            });
        }
        
        DAOPersona.create(persona, callback);
    }

    updatePersona(id, personaData, callback) {
        const persona = new Persona(personaData);
        const errores = persona.validar();
        
        if (errores.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errores 
            });
        }
        
        DAOPersona.update(id, persona, callback);
    }

    deletePersona(id, callback) {
        DAOPersona.delete(id, callback);
    }

    createPersonaFromName(nombre, callback) {
        if (!isNaN(nombre)) {
            return callback(null, parseInt(nombre));
        }
        
        const persona = Persona.fromNombre(nombre);
        
        DAOPersona.create(persona, (err, personaCreada) => {
            if (err) {
                console.error('Error creando persona:', err);
                return callback(err);
            }
            
            console.log('Nueva persona creada:', personaCreada.toJSON());
            callback(null, personaCreada.id_persona);
        });
    }

    searchPersonas(query, callback) {
        DAOPersona.search(query, callback);
    }

    getAllPersonas(callback) {
        DAOPersona.getAll(callback);
    }

    getPersonaById(id, callback) {
        DAOPersona.getById(id, callback);
    }
}

module.exports = new SAPersona();