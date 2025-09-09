const db = require('../config/db');

class DAOEndoso {
    // CREATE
    create(endoso, callback) {
        const { fecha_endoso, valor, id_moneda, id_tipo_negociacion, id_ciudad, comentarios, id_tipo_valor } = endoso;
        
        if (!fecha_endoso || !valor || !id_moneda || !id_tipo_negociacion) {
            return callback(new Error('Faltan campos obligatorios'));
        }
        
        // Campos opcionales
        const ciudadValue = id_ciudad || null;
        const comentariosValue = comentarios || null;
        const tipoValorValue = id_tipo_valor || null;
        
        const query = `
            INSERT INTO endoso (fecha_endoso, valor, id_moneda, id_tipo_negociacion, id_ciudad, comentarios, id_tipo_valor) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.pool.query(query, [fecha_endoso, valor, id_moneda, id_tipo_negociacion, ciudadValue, comentariosValue, tipoValorValue], (err, result) => {
            if (err) {
                console.error('Error in DAOEndoso.create:', err);
                return callback(err);
            }
            this.getById(result.insertId, callback);
        });
    }

    // READ ALL
    getAll(callback) {
        const query = `
            SELECT e.*, 
                   m.nombre_moneda, 
                   tn.nombre as tipo_negociacion_nombre,
                   c.nombre_ciudad,
                   tv.nombre as tipo_valor_nombre,
                   GROUP_CONCAT(DISTINCT CONCAT(r.id_rol, ':', rn.nombre_rol, ':', p.nombre, ':', c_rol.nombre_ciudad) 
                   SEPARATOR '|') as roles_info,
                   GROUP_CONCAT(DISTINCT CONCAT(le.id_letra, ':', l.fecha_letra, ':', l.importe) 
                   SEPARATOR '|') as letras_relacionadas
            FROM endoso e
            LEFT JOIN moneda m ON e.id_moneda = m.id_moneda
            LEFT JOIN tipo_negociacion tn ON e.id_tipo_negociacion = tn.id_tipo_negociacion
            LEFT JOIN ciudad c ON e.id_ciudad = c.id_ciudad
            LEFT JOIN tipo_valor tv ON e.id_tipo_valor = tv.id_tipo_valor
            LEFT JOIN endoso_roles er ON e.id_endoso = er.id_endoso
            LEFT JOIN rol r ON er.id_rol = r.id_rol
            LEFT JOIN rol_nombres rn ON r.id_rol = rn.id_rol
            LEFT JOIN persona p ON er.id_persona = p.id_persona
            LEFT JOIN ciudad c_rol ON er.id_ciudad = c_rol.id_ciudad
            LEFT JOIN letra_endoso le ON e.id_endoso = le.id_endoso
            LEFT JOIN letracambio l ON le.id_letra = l.id_letra
            GROUP BY e.id_endoso
            ORDER BY e.fecha_endoso DESC`;

        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOEndoso.getAll:', err);
                return callback(err);
            }
            callback(null, this.processEndososResults(results));
        });
    }

    // READ ONE
    getById(id, callback) {
        const query = `
            SELECT e.*, m.nombre_moneda, tn.nombre as tipo_negociacion_nombre,
                   GROUP_CONCAT(DISTINCT CONCAT(r.id_rol, ':', rn.nombre_rol, ':', p.nombre, ':', c.nombre_ciudad) 
                   SEPARATOR '|') as roles_info
            FROM endoso e
            LEFT JOIN moneda m ON e.id_moneda = m.id_moneda
            LEFT JOIN tipo_negociacion tn ON e.id_tipo_negociacion = tn.id_tipo_negociacion
            LEFT JOIN endoso_roles er ON e.id_endoso = er.id_endoso
            LEFT JOIN rol r ON er.id_rol = r.id_rol
            LEFT JOIN rol_nombres rn ON r.id_rol = rn.id_rol
            LEFT JOIN persona p ON er.id_persona = p.id_persona
            LEFT JOIN ciudad c ON er.id_ciudad = c.id_ciudad
            WHERE e.id_endoso = ?
            GROUP BY e.id_endoso`;

        db.pool.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error in DAOEndoso.getById:', err);
                return callback(err);
            }
            callback(null, this.processEndososResults(results)[0] || null);
        });
    }

    update(id, endoso, callback) {
        const { fecha_endoso, valor, id_moneda, id_tipo_negociacion, id_ciudad, comentarios, id_tipo_valor } = endoso;
        
        if (!fecha_endoso || !valor || !id_moneda || !id_tipo_negociacion) {
            return callback(new Error('Faltan campos obligatorios'));
        }
        
        const ciudadValue = id_ciudad || null;
        const comentariosValue = comentarios || null;
        const tipoValorValue = id_tipo_valor || null;
        
        const query = `
            UPDATE endoso 
            SET fecha_endoso = ?, valor = ?, id_moneda = ?, id_tipo_negociacion = ?, id_ciudad = ?, comentarios = ?, id_tipo_valor = ?
            WHERE id_endoso = ?
        `;
        
        db.pool.query(query, [fecha_endoso, valor, id_moneda, id_tipo_negociacion, ciudadValue, comentariosValue, tipoValorValue, id], (err, result) => {
            if (err) {
                console.error('Error in DAOEndoso.update:', err);
                return callback(err);
            }
            
            this.getById(id, callback);
        });
    }

    delete(id, callback) {
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
        
                // 1. Comprobar si el endoso existe 
                connection.query(
                    'SELECT * FROM endoso WHERE id_endoso = ?',
                    [id],
                    (err, results) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }
                        if (results.length === 0) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(new Error('Endoso not found'));
                            });
                        }
        
                        // 2. Borrar roles del endoso
                        connection.query(
                            'DELETE FROM endoso_roles WHERE id_endoso = ?',
                            [id],
                            err => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(err);
                                    });
                                }
        
                                // 3. Borrar relaciones letra endoso
                                connection.query(
                                    'DELETE FROM letra_endoso WHERE id_endoso = ?',
                                    [id],
                                    err => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                callback(err);
                                            });
                                        }
        
                                        // 4. Borrar el endoso
                                        connection.query(
                                            'DELETE FROM endoso WHERE id_endoso = ?',
                                            [id],
                                            err => {
                                                if (err) {
                                                    return connection.rollback(() => {
                                                        connection.release();
                                                        callback(err);
                                                    });
                                                }
        
                                                // 5. commit 
                                                connection.commit(err => {
                                                    if (err) {
                                                        return connection.rollback(() => {
                                                            connection.release();
                                                            callback(err);
                                                        });
                                                    }
                                                    connection.release();
                                                    callback(null, {
                                                        success: true,
                                                        message: 'Endoso deleted successfully'
                                                    });
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            });
        });
    }

    getTiposNegociacion(callback) {
        const query = 'SELECT * FROM tipo_negociacion ORDER BY nombre';
        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOEndoso.getTiposNegociacion:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }

    insertEndosoRoles(endosoId, roles, callback) {
        if (!roles || roles.length === 0) return callback();

        const values = roles.map(r => [endosoId, r.id_ciudad, r.id_persona, r.id_rol]);
        db.pool.query(
            'INSERT INTO endoso_roles (id_endoso, id_ciudad, id_persona, id_rol) VALUES ?',
            [values],
            callback
        );
    }

    insertEndosoRolesWithConnection(connection, endosoId, roles, callback) {
        if (!roles || roles.length === 0) return callback();

        const values = roles.map(r => [endosoId, r.id_ciudad, r.id_persona, r.id_rol]);
        connection.query(
            'INSERT INTO endoso_roles (id_endoso, id_ciudad, id_persona, id_rol) VALUES ?',
            [values],
            callback
        );
    }

    processEndososResults(results) {
        return results.map(row => ({
            id_endoso: row.id_endoso,
            fecha_endoso: row.fecha_endoso,
            valor: row.valor,
            id_moneda: row.id_moneda,
            moneda_nombre: row.nombre_moneda || '',
            id_tipo_negociacion: row.id_tipo_negociacion,
            tipo_negociacion_nombre: row.tipo_negociacion_nombre || '',
            id_ciudad: row.id_ciudad,
            ciudad_nombre: row.nombre_ciudad || '',
            id_tipo_valor: row.id_tipo_valor,
            tipo_valor_nombre: row.tipo_valor_nombre || '',
            comentarios: row.comentarios || '',
            letras_relacionadas: row.letras_relacionadas || '',
            roles_info: row.roles_info || ''
        }));
    }
}

module.exports = new DAOEndoso();