const db = require('../config/db');
const Rol = require('../entidades/Rol');

class DAORol {
    // CREATE
    create(rolData, callback) {
        const data = rolData instanceof Rol ? 
            rolData.toDatabase() : rolData;
            
        // Primero insertar en tabla rol
        db.pool.query(
            'INSERT INTO rol (tipo) VALUES (?)',
            [data.tipo],
            (err, rolResult) => {
                if (err) {
                    console.error('Error in DAORol.create (rol):', err);
                    return callback(err);
                }
                
                const rolId = rolResult.insertId;
                
                // Luego insertar en tabla rol_nombres
                db.pool.query(
                    'INSERT INTO rol_nombres (id_rol, nombre_rol) VALUES (?, ?)',
                    [rolId, data.nombre_rol],
                    (err, nombresResult) => {
                        if (err) {
                            console.error('Error in DAORol.create (rol_nombres):', err);
                            return callback(err);
                        }
                        
                        const nuevoRol = new Rol({
                            id_rol: rolId,
                            nombre_rol: data.nombre_rol,
                            tipo: data.tipo
                        });                      
                        callback(null, nuevoRol);
                    }
                );
            }
        );
    }

    // READ ALL
    getAll(callback) {
        const query = `
            SELECT r.id_rol, r.tipo, rn.nombre_rol
            FROM rol r
            JOIN rol_nombres rn ON r.id_rol = rn.id_rol
            ORDER BY r.tipo, rn.nombre_rol
        `;
        
        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAORol.getAll:', err);
                return callback(err);
            }
            const roles = results.map(row => Rol.fromDatabase(row));
            callback(null, roles);
        });
    }

    // READ BY TYPE
    getByType(tipo, callback) {
        const query = `
            SELECT r.id_rol, r.tipo, rn.nombre_rol
            FROM rol r
            JOIN rol_nombres rn ON r.id_rol = rn.id_rol
            WHERE r.tipo = ?
            ORDER BY rn.nombre_rol
        `;
        
        db.pool.query(query, [tipo], (err, results) => {
            if (err) {
                console.error('Error in DAORol.getByType:', err);
                return callback(err);
            }
            const roles = results.map(row => Rol.fromDatabase(row));
            callback(null, roles);
        });
    }

    // READ ONE
    getById(id, callback) {
        const query = `
            SELECT r.id_rol, r.tipo, rn.nombre_rol
            FROM rol r
            JOIN rol_nombres rn ON r.id_rol = rn.id_rol
            WHERE r.id_rol = ?
        `;
        
        db.pool.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error in DAORol.getById:', err);
                return callback(err);
            }
            
            if (results.length === 0) {
                return callback(null, null);
            }
            const rol = Rol.fromDatabase(results[0]);
            callback(null, rol);
        });
    }

    // UPDATE
    update(id, rolData, callback) {
        const data = rolData instanceof Rol ? 
            rolData.toDatabase() : rolData;
            
        // Usar transacción para actualizar ambas tablas (rol y rol_nombres)
        db.pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection:', err);
                return callback(err);
            }
            
            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }
                
                // Actualizar tabla rol
                connection.query(
                    'UPDATE rol SET tipo = ? WHERE id_rol = ?',
                    [data.tipo, id],
                    (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }
                        
                        if (result.affectedRows === 0) {
                            return connection.rollback(() => {
                                connection.release();
                                callback({ message: 'Rol not found' });
                            });
                        }
                        
                        // Actualizar tabla rol_nombres
                        connection.query(
                            'UPDATE rol_nombres SET nombre_rol = ? WHERE id_rol = ?',
                            [data.nombre_rol, id],
                            (err, result) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
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
                                    this.getById(id, callback);
                                });
                            }
                        );
                    }
                );
            });
        });
    }

    // DELETE
    delete(id, callback) {
        // Verificar si el rol está siendo usado antes de eliminar
        const checkQuery = `
            SELECT 
                (SELECT COUNT(*) FROM protesto_roles WHERE id_rol = ?) as protesto_count,
                (SELECT COUNT(*) FROM letra_roles WHERE id_rol = ?) as letra_count,
                (SELECT COUNT(*) FROM endoso_roles WHERE id_rol = ?) as endoso_count
        `;
        
        db.pool.query(checkQuery, [id, id, id], (err, results) => {
            if (err) {
                console.error('Error checking rol usage:', err);
                return callback(err);
            }
            
            const { protesto_count, letra_count, endoso_count } = results[0];
            if (protesto_count > 0 || letra_count > 0 || endoso_count > 0) {
                return callback({ 
                    message: 'Cannot delete rol with existing references' 
                });
            }
            
            // Usar transacción para eliminar de ambas tablas
            db.pool.getConnection((err, connection) => {
                if (err) {
                    return callback(err);
                }
                
                connection.beginTransaction(err => {
                    if (err) {
                        connection.release();
                        return callback(err);
                    }
                    
                    // Eliminar de rol_nombres primero
                    connection.query(
                        'DELETE FROM rol_nombres WHERE id_rol = ?',
                        [id],
                        (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(err);
                                });
                            }
                            
                            // Luego eliminar de rol
                            connection.query(
                                'DELETE FROM rol WHERE id_rol = ?',
                                [id],
                                (err, result) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            callback(err);
                                        });
                                    }
                                    
                                    if (result.affectedRows === 0) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            callback({ message: 'Rol not found' });
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
                                        callback(null, { success: true });
                                    });
                                }
                            );
                        }
                    );
                });
            });
        });
    }
}

module.exports = new DAORol();