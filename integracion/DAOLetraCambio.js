const db = require('../config/db');

class DAOLetraCambio {
    create(letra, callback) {
        const { 
            fecha_letra, 
            fecha_vencimiento, 
            importe, 
            id_moneda, 
            id_tipo_letra, 
            id_tipo_plazo, 
            id_tipo_valor, 
            id_ciudad, 
            texto_indicacion, 
            plazo_dias, 
            comentarios, 
            uso 
        } = letra;
        
        if (!fecha_letra || !importe || !id_moneda || !id_tipo_letra) {
            return callback(new Error('Faltan campos obligatorios: fecha_letra, importe, id_moneda, id_tipo_letra'));
        }
        
        const fechaVencValue = fecha_vencimiento || null;
        const tipoPlazoValue = id_tipo_plazo || null;
        const tipoValorValue = id_tipo_valor || null;
        const ciudadValue = id_ciudad || null;
        const textoIndicacionValue = texto_indicacion || null;
        const plazoDiasValue = plazo_dias || null;
        const comentariosValue = comentarios || null;
        const usoValue = uso || null;
        
        const query = `
            INSERT INTO letracambio (
                fecha_letra, fecha_vencimiento, importe, id_moneda, id_tipo_letra, 
                id_tipo_plazo, id_tipo_valor, id_ciudad, texto_indicacion, 
                plazo_dias, comentarios, uso
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.pool.query(query, [
            fecha_letra, fechaVencValue, importe, id_moneda, id_tipo_letra,
            tipoPlazoValue, tipoValorValue, ciudadValue, textoIndicacionValue,
            plazoDiasValue, comentariosValue, usoValue
        ], (err, result) => {
            if (err) {
                console.error('Error in DAOLetraCambio.create:', err);
                return callback(err);
            }
            
            this.getById(result.insertId, callback);
        });
    }

    // READ ALL
    getAll(callback) {
        const query = `
            SELECT l.*, 
                   m.nombre_moneda, 
                   tl.nombre as tipo_letra_nombre,
                   c.nombre_ciudad,
                   tp.nombre as tipo_plazo_nombre,
                   tv.nombre as tipo_valor_nombre
            FROM letracambio l
            LEFT JOIN moneda m ON l.id_moneda = m.id_moneda
            LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
            LEFT JOIN ciudad c ON l.id_ciudad = c.id_ciudad
            LEFT JOIN tipo_plazo tp ON l.id_tipo_plazo = tp.id_tipo_plazo
            LEFT JOIN tipo_valor tv ON l.id_tipo_valor = tv.id_tipo_valor
            ORDER BY l.fecha_letra DESC
        `;

        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOLetraCambio.getAll:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }

    // READ ONE
    getById(id, callback) {
        const query = `
            SELECT l.*, m.nombre_moneda,
                   tl.nombre as tipo_letra_nombre,
                   tv.nombre as tipo_valor_nombre,
                   tp.nombre as tipo_plazo_nombre
            FROM letracambio l
            LEFT JOIN moneda m ON l.id_moneda = m.id_moneda
            LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
            LEFT JOIN tipo_valor tv ON l.id_tipo_valor = tv.id_tipo_valor
            LEFT JOIN tipo_plazo tp ON l.id_tipo_plazo = tp.id_tipo_plazo
            WHERE l.id_letra = ?`;

        db.pool.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error in DAOLetraCambio.getById:', err);
                return callback(err);
            }
            callback(null, results[0] || null);
        });
    }

    // UPDATE
    update(id, letra, callback) {
        const { 
            fecha_letra, 
            fecha_vencimiento, 
            importe, 
            id_moneda, 
            id_tipo_letra, 
            id_tipo_plazo, 
            id_tipo_valor, 
            id_ciudad, 
            texto_indicacion, 
            plazo_dias, 
            comentarios, 
            uso 
        } = letra;
        
        if (!fecha_letra || !importe || !id_moneda || !id_tipo_letra) {
            return callback(new Error('Faltan campos obligatorios'));
        }
        
        const fechaVencValue = fecha_vencimiento || null;
        const tipoPlazoValue = id_tipo_plazo || null;
        const tipoValorValue = id_tipo_valor || null;
        const ciudadValue = id_ciudad || null;
        const textoIndicacionValue = texto_indicacion || null;
        const plazoDiasValue = plazo_dias || null;
        const comentariosValue = comentarios || null;
        const usoValue = uso || null;
        
        const query = `
            UPDATE letracambio 
            SET fecha_letra = ?, fecha_vencimiento = ?, importe = ?, id_moneda = ?, 
                id_tipo_letra = ?, id_tipo_plazo = ?, id_tipo_valor = ?, id_ciudad = ?, 
                texto_indicacion = ?, plazo_dias = ?, comentarios = ?, uso = ?
            WHERE id_letra = ?
        `;
        
        db.pool.query(query, [
            fecha_letra, fechaVencValue, importe, id_moneda, id_tipo_letra,
            tipoPlazoValue, tipoValorValue, ciudadValue, textoIndicacionValue,
            plazoDiasValue, comentariosValue, usoValue, id
        ], (err, result) => {
            if (err) {
                console.error('Error in DAOLetraCambio.update:', err);
                return callback(err);
            }
            
            this.getById(id, callback);
        });
    }

    // DELETE
    delete(id, callback) {
        // Obtener una conexión del pool
        db.pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting connection from pool:', err);
                return callback(err);
            }

            // Iniciar transacción
            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                // Primero borrar roles letra letra_roles
                connection.query('DELETE FROM letra_roles WHERE id_letra = ?', [id], err => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    // Borrar relaciones con letra -> letra_endoso 
                    connection.query('DELETE FROM letra_endoso WHERE id_letra = ?', [id], err => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }

                        // Borrar letra
                        connection.query('DELETE FROM letracambio WHERE id_letra = ?', [id], err => {
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
                                callback(null, { success: true });
                            });
                        });
                    });
                });
            });
        });
    }

    insertLetraRoles(letraId, roles, callback) {
        if (!roles || roles.length === 0) return callback();

        const values = roles.map(r => [letraId, r.id_ciudad, r.id_persona, r.id_rol]);
        db.pool.query(
            'INSERT INTO letra_roles (id_letra, id_ciudad, id_persona, id_rol) VALUES ?',
            [values],
            callback
        );
    }

    insertLetraRolesWithConnection(connection, letraId, roles, callback) {
        if (!roles || roles.length === 0) return callback();

        const values = roles.map(r => [letraId, r.id_ciudad, r.id_persona, r.id_rol]);
        connection.query(
            'INSERT INTO letra_roles (id_letra, id_ciudad, id_persona, id_rol) VALUES ?',
            [values],
            callback
        );
    }

    processLetraResults(results) {
        return results.map(row => ({
            id_letra: row.id_letra,
            fecha_letra: row.fecha_letra,
            fecha_vencimiento: row.fecha_vencimiento,
            importe: row.importe,
            id_moneda: row.id_moneda,
            moneda_nombre: row.nombre_moneda,
            id_tipo_letra: row.id_tipo_letra,
            tipo_letra_nombre: row.tipo_letra_nombre,
            id_tipo_valor: row.id_tipo_valor,
            tipo_valor_nombre: row.tipo_valor_nombre,
            id_tipo_plazo: row.id_tipo_plazo,
            tipo_plazo_nombre: row.tipo_plazo_nombre,
            roles: row.roles_info ? row.roles_info.split('|').map(role => {
                const [id_rol, nombre_rol, nombre_persona, nombre_ciudad] = role.split(':');
                return { id_rol, nombre_rol, nombre_persona, nombre_ciudad };
            }) : []
        }));
    }

    getTiposLetra(callback) {
        const query = 'SELECT * FROM tipo_letra ORDER BY nombre';
        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOLetraCambio.getTiposLetra:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }
    
    getTiposValor(callback) {
        const query = 'SELECT * FROM tipo_valor ORDER BY nombre';
        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOLetraCambio.getTiposValor:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }
    
    getTiposPlazo(callback) {
        const query = 'SELECT * FROM tipo_plazo ORDER BY nombre';
        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOLetraCambio.getTiposPlazo:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }
}

module.exports = new DAOLetraCambio();