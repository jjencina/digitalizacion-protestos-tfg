const DAOCiudad = require('../integracion/DAOCiudad');
const Ciudad = require('../entidades/Ciudad');

class SACiudad {
    constructor() {
        this.daoCiudad = new DAOCiudad();
    }

    processCiudadFields(data, fields, callback) {
        let pendingOperations = 0;
        let hasError = false;

        const processField = (field) => {
            if (data[field] && typeof data[field] === 'string' && isNaN(data[field])) {
                pendingOperations++;
                this.createCiudad(data[field], (err, ciudadId) => {
                    if (hasError) return;
                    
                    if (err) {
                        hasError = true;
                        return callback(err);
                    }
                    
                    console.log(`Campo ${field} procesado: ${data[field]} -> ${ciudadId}`);
                    data[field] = ciudadId;
                    
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

    processRolesCiudades(roles, context, callback) {
        if (!roles || !roles.length) {
            return callback(null, roles);
        }

        let pendingOperations = 0;
        let hasError = false;

        roles.forEach((rol, index) => {
            // Procesar por ID
            if (rol.id_ciudad && typeof rol.id_ciudad === 'string' && isNaN(rol.id_ciudad)) {
                pendingOperations++;
                this.createCiudad(rol.id_ciudad, (err, ciudadId) => {
                    if (hasError) return;
                    
                    if (err) {
                        hasError = true;
                        return callback(err);
                    }
                    
                    console.log(`${context} rol[${index}] ciudad procesada: ${rol.id_ciudad} -> ${ciudadId}`);
                    roles[index].id_ciudad = ciudadId;
                    
                    pendingOperations--;
                    if (pendingOperations === 0) {
                        callback(null, roles);
                    }
                });
            }
            
            // Procesar por nombre si no hay ID
            if (rol.ciudad_nombre && (!rol.id_ciudad || rol.id_ciudad === null)) {
                pendingOperations++;
                this.createCiudad(rol.ciudad_nombre, (err, ciudadId) => {
                    if (hasError) return;
                    
                    if (err) {
                        hasError = true;
                        return callback(err);
                    }
                    
                    console.log(`${context} rol[${index}] ciudad procesada: ${rol.ciudad_nombre} -> ${ciudadId}`);
                    roles[index].id_ciudad = ciudadId;
                    
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

    createCiudad(ciudadData, callback) {
        // Si es un string nombre, usar el método existente para nombres
        if (typeof ciudadData === 'string') {
            return this.createCiudadFromName(ciudadData, callback);
        }
        
        const ciudad = new Ciudad(ciudadData);
        const errores = ciudad.validar();
        
        if (errores.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errores 
            });
        }
        
        this.daoCiudad.create(ciudad, callback);
    }

    updateCiudad(id, ciudadData, callback) {
        const ciudad = new Ciudad(ciudadData);
        const errores = ciudad.validar();
        
        if (errores.length > 0) {
            return callback({ 
                message: 'Errores de validación', 
                errores: errores 
            });
        }
        
        this.daoCiudad.update(id, ciudad, callback);
    }

    deleteCiudad(id, callback) {
        this.daoCiudad.delete(id, callback);
    }

    createCiudadFromName(nombre, callback) {
        if (!isNaN(nombre)) {
            return callback(null, parseInt(nombre));
        }
        
        const ciudad = Ciudad.fromNombre(nombre);

        // Evitar duplicados: buscar por nombre antes de crear
        this.daoCiudad.findByName(ciudad.nombre_ciudad, ciudad.pais || '', (err, encontrada) => {
            if (err) {
                console.error('Error buscando ciudad por nombre:', err);
                return callback(err);
            }
            if (encontrada) {
                return callback(null, encontrada.id_ciudad);
            }
            this.daoCiudad.create(ciudad, (err2, ciudadCreada) => {
                if (err2) {
                    console.error('Error creando ciudad:', err2);
                    return callback(err2);
                }
                console.log('Nueva ciudad creada:', ciudadCreada.toJSON());
                callback(null, ciudadCreada.id_ciudad);
            });
        });
    }

    searchCiudades(nombre, callback) {
        this.daoCiudad.searchByName(nombre, callback);
    }

    getAllCiudades(callback) {
        this.daoCiudad.getAll(callback);
    }

    getAllCiudadesWithCoordinates(callback) {
        this.daoCiudad.getAllWithCoordinates(callback);
    }

    getCityStatistics(callback) {
        this.daoCiudad.getCityStatistics(callback);
    }

    getCityConnections(callback) {
        this.daoCiudad.getCityConnections(callback);
    }

    findByName(nombreCiudad, pais, callback) {
        this.daoCiudad.findByName(nombreCiudad, pais, callback);
    }
    
    getCiudadById(id, callback) {
        this.daoCiudad.getById(id, callback);
    }
}

module.exports = new SACiudad();