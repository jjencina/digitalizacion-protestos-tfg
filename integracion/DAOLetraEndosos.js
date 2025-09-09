const db = require('../config/db');

class DAOLetraEndosos {
    // Obtener todas las relaciones
    getAll(callback) {
        const query = `
            SELECT le.id_letra, le.id_endoso,
                   l.fecha_letra,
                   l.importe AS importe_letra,
                   l.fecha_vencimiento,
                   ml.nombre_moneda AS moneda_letra,
                   tl.nombre AS tipo_letra_nombre,
                   c_letra.nombre_ciudad AS ciudad_letra,
                   e.fecha_endoso,
                   e.valor AS valor_endoso,
                   me.nombre_moneda AS moneda_endoso,
                   tn.nombre AS tipo_negociacion_nombre,
                   c_endoso.nombre_ciudad AS ciudad_endoso
            FROM letra_endoso le
            JOIN letracambio l ON le.id_letra = l.id_letra
            JOIN endoso e ON le.id_endoso = e.id_endoso
            LEFT JOIN moneda ml ON l.id_moneda = ml.id_moneda
            LEFT JOIN moneda me ON e.id_moneda = me.id_moneda
            LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
            LEFT JOIN tipo_negociacion tn ON e.id_tipo_negociacion = tn.id_tipo_negociacion
            LEFT JOIN ciudad c_letra ON l.id_ciudad = c_letra.id_ciudad
            LEFT JOIN ciudad c_endoso ON e.id_ciudad = c_endoso.id_ciudad
            ORDER BY le.id_letra DESC, le.id_endoso DESC`;
        
        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOLetraEndosos.getAll:', err);
                return callback(err);
            }
            
            // Procesamos los resultados para crear un campo id_relacion sintético
            const processedResults = results.map(row => {
                return {
                    id_relacion: `${row.id_letra}-${row.id_endoso}`,
                    id_letra: row.id_letra,
                    fecha_letra: row.fecha_letra,
                    importe_letra: row.importe_letra,
                    fecha_vencimiento: row.fecha_vencimiento,
                    moneda_letra: row.moneda_letra,
                    tipo_letra_nombre: row.tipo_letra_nombre,
                    ciudad_letra: row.ciudad_letra,
                    id_endoso: row.id_endoso,
                    fecha_endoso: row.fecha_endoso,
                    valor_endoso: row.valor_endoso,
                    moneda_endoso: row.moneda_endoso,
                    tipo_negociacion_nombre: row.tipo_negociacion_nombre,
                    ciudad_endoso: row.ciudad_endoso,
                    letra_detalles: `Fecha: ${new Date(row.fecha_letra).toLocaleDateString()}, Importe: ${row.importe_letra} ${row.moneda_letra || ''}`,
                    endoso_detalles: `Fecha: ${new Date(row.fecha_endoso).toLocaleDateString()}, Valor: ${row.valor_endoso} ${row.moneda_endoso || ''}`
                };
            });
            
            callback(null, processedResults);
        });
    }

    // Obtener una relación por ID
    getById(id, callback) {
        // Como no tenemos un ID real en la tabla, vamos a parsear el ID de la tabla que tiene este formato 'id_letra-id_endoso'
        let id_letra, id_endoso;
        try {
            [id_letra, id_endoso] = id.split('-').map(Number);
        } catch (err) {
            return callback(new Error('ID de relación inválido'));
        }
        
        const query = `
            SELECT le.id_letra, le.id_endoso,
                   l.fecha_letra,
                   l.importe AS importe_letra,
                   l.fecha_vencimiento,
                   ml.nombre_moneda AS moneda_letra,
                   tl.nombre AS tipo_letra_nombre,
                   c_letra.nombre_ciudad AS ciudad_letra,
                   e.fecha_endoso,
                   e.valor AS valor_endoso,
                   me.nombre_moneda AS moneda_endoso,
                   tn.nombre AS tipo_negociacion_nombre,
                   c_endoso.nombre_ciudad AS ciudad_endoso
            FROM letra_endoso le
            JOIN letracambio l ON le.id_letra = l.id_letra
            JOIN endoso e ON le.id_endoso = e.id_endoso
            LEFT JOIN moneda ml ON l.id_moneda = ml.id_moneda
            LEFT JOIN moneda me ON e.id_moneda = me.id_moneda
            LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
            LEFT JOIN tipo_negociacion tn ON e.id_tipo_negociacion = tn.id_tipo_negociacion
            LEFT JOIN ciudad c_letra ON l.id_ciudad = c_letra.id_ciudad
            LEFT JOIN ciudad c_endoso ON e.id_ciudad = c_endoso.id_ciudad
            WHERE le.id_letra = ? AND le.id_endoso = ?`;
        
        db.pool.query(query, [id_letra, id_endoso], (err, results) => {
            if (err) {
                console.error('Error in DAOLetraEndosos.getById:', err);
                return callback(err);
            }
            
            if (results.length === 0) {
                return callback(null, null);
            }
            
            const row = results[0];
            const result = {
                id_relacion: `${row.id_letra}-${row.id_endoso}`,
                id_letra: row.id_letra,
                fecha_letra: row.fecha_letra,
                importe_letra: row.importe_letra,
                fecha_vencimiento: row.fecha_vencimiento,
                moneda_letra: row.moneda_letra,
                tipo_letra_nombre: row.tipo_letra_nombre,
                ciudad_letra: row.ciudad_letra,
                id_endoso: row.id_endoso,
                fecha_endoso: row.fecha_endoso,
                valor_endoso: row.valor_endoso,
                moneda_endoso: row.moneda_endoso,
                tipo_negociacion_nombre: row.tipo_negociacion_nombre,
                ciudad_endoso: row.ciudad_endoso,
                letra_detalles: `Fecha: ${new Date(row.fecha_letra).toLocaleDateString()}, Importe: ${row.importe_letra} ${row.moneda_letra || ''}`,
                endoso_detalles: `Fecha: ${new Date(row.fecha_endoso).toLocaleDateString()}, Valor: ${row.valor_endoso} ${row.moneda_endoso || ''}`
            };
            
            callback(null, result);
        });
    }

    // Crear nueva relación
    create(data, callback) {
        const { id_letra, id_endoso } = data;
        
        // Verificar que no exista ya la relación
        this.findExisting(id_letra, id_endoso, (err, existing) => {
            if (err) return callback(err);
            
            if (existing) {
                return callback(new Error('Esta relación ya existe'));
            }
            
            const query = 'INSERT INTO letra_endoso (id_letra, id_endoso) VALUES (?, ?)';
            
            db.pool.query(query, [id_letra, id_endoso], (err, result) => {
                if (err) {
                    console.error('Error in DAOLetraEndosos.create:', err);
                    return callback(err);
                }
                
                this.getById(`${id_letra}-${id_endoso}`, callback);
            });
        });
    }

    // Buscar una relación existente
    findExisting(id_letra, id_endoso, callback) {
        const query = 'SELECT * FROM letra_endoso WHERE id_letra = ? AND id_endoso = ?';
        
        db.pool.query(query, [id_letra, id_endoso], (err, results) => {
            if (err) {
                console.error('Error in DAOLetraEndosos.findExisting:', err);
                return callback(err);
            }
            callback(null, results[0] || null);
        });
    }

    // Actualizar una relación existente
    update(id, data, callback) {
        // Parsear el ID
        let currentId_letra, currentId_endoso;
        try {
            [currentId_letra, currentId_endoso] = id.split('-').map(Number);
        } catch (err) {
            return callback(new Error('ID de relación inválido'));
        }
        
        const { id_letra, id_endoso } = data;
        
        // Verificar que no exista ya otra relación con los mismos ids
        if (currentId_letra === id_letra && currentId_endoso === id_endoso) {
            // Si no hay cambios devoler la relación actual
            return this.getById(id, callback);
        }
        
        db.pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection from pool:', err);
                return callback(err);
            }
            
            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }
                
                // Primero verificamos si ya existe la nueva relación
                connection.query('SELECT * FROM letra_endoso WHERE id_letra = ? AND id_endoso = ?',
                    [id_letra, id_endoso], (err, results) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }
                    
                    if (results.length > 0) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(new Error('Esta relación ya existe con otro ID'));
                        });
                    }
                    
                    // Eliminamos la relación actual
                    connection.query('DELETE FROM letra_endoso WHERE id_letra = ? AND id_endoso = ?', 
                        [currentId_letra, currentId_endoso], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                console.error('Error eliminando relación actual:', err);
                                callback(err);
                            });
                        }
                        
                        // Luego creamos la nueva relación
                        connection.query('INSERT INTO letra_endoso (id_letra, id_endoso) VALUES (?, ?)', 
                            [id_letra, id_endoso], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.error('Error creando nueva relación:', err);
                                    callback(err);
                                });
                            }
                            
                            connection.commit(err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(err);
                                    });
                                }
                                connection.release();
                                this.getById(`${id_letra}-${id_endoso}`, callback);
                            });
                        });
                    });
                });
            });
        });
    }

    // Eliminar una relación
    delete(id, callback) {
        let id_letra, id_endoso;
        try {
            [id_letra, id_endoso] = id.split('-').map(Number);
        } catch (err) {
            return callback(new Error('ID de relación inválido'));
        }
        
        const query = 'DELETE FROM letra_endoso WHERE id_letra = ? AND id_endoso = ?';
        
        db.pool.query(query, [id_letra, id_endoso], (err, result) => {
            if (err) {
                console.error('Error in DAOLetraEndosos.delete:', err);
                return callback(err);
            }
            
            callback(null, { 
                success: true, 
                id_relacion: id, 
                id_letra, 
                id_endoso, 
                affectedRows: result.affectedRows 
            });
        });
    }

    // Obtener endosos relacionados con una letra
    getEndososByLetra(letraId, callback) {
        const query = `
            SELECT e.*, m.nombre_moneda, tn.nombre AS tipo_negociacion_nombre, c.nombre_ciudad  
            FROM endoso e
            JOIN letra_endoso le ON e.id_endoso = le.id_endoso
            LEFT JOIN moneda m ON e.id_moneda = m.id_moneda
            LEFT JOIN tipo_negociacion tn ON e.id_tipo_negociacion = tn.id_tipo_negociacion
            LEFT JOIN ciudad c ON e.id_ciudad = c.id_ciudad
            WHERE le.id_letra = ?
            ORDER BY e.fecha_endoso`;
        
        db.pool.query(query, [letraId], (err, results) => {
            if (err) {
                console.error('Error in DAOLetraEndosos.getEndososByLetra:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }

    // Obtener letras relacionadas con un endoso
    getLetrasByEndoso(endosoId, callback) {
        const query = `
            SELECT l.*, m.nombre_moneda, tl.nombre AS tipo_letra_nombre, c.nombre_ciudad
            FROM letracambio l
            JOIN letra_endoso le ON l.id_letra = le.id_letra
            LEFT JOIN moneda m ON l.id_moneda = m.id_moneda
            LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
            LEFT JOIN ciudad c ON l.id_ciudad = c.id_ciudad
            WHERE le.id_endoso = ?
            ORDER BY l.fecha_letra`;
        
        db.pool.query(query, [endosoId], (err, results) => {
            if (err) {
                console.error('Error in DAOLetraEndosos.getLetrasByEndoso:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }
}

module.exports = new DAOLetraEndosos();