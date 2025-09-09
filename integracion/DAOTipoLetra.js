const db = require('../config/db');

class DAOTipoLetra {
    create(tipoData, callback) {
        const { nombre, descripcion } = tipoData;
        
        if (!nombre || !nombre.trim()) {
            return callback(new Error('Nombre de tipo de letra es requerido'));
        }
        
        db.pool.query(
            'INSERT INTO tipo_letra (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion],
            (err, result) => {
                if (err) {
                    console.error('Error in DAOTipoLetra.create:', err);
                    return callback(err);
                }
                
                if (!result || !result.insertId) {
                    return callback(new Error('No se pudo obtener ID de tipo de letra insertado'));
                }
                
                callback(null, { 
                    id_tipo_letra: result.insertId,
                    nombre,
                    descripcion
                });
            }
        );
    }
    
    search(query, callback) {
        const sql = `SELECT * FROM tipo_letra WHERE nombre LIKE ? ORDER BY nombre`;
        
        db.pool.query(sql, [`%${query}%`], (err, results) => {
            if (err) {
                console.error('Error in DAOTipoLetra.search:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }
    
    getAll(callback) {
        const sql = 'SELECT id_tipo_letra, nombre, descripcion FROM tipo_letra ORDER BY nombre';
        
        db.pool.query(sql, (err, results) => {
            if (err) {
                console.error('Error in DAOTipoLetra.getAll:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }

    findByName(nombre, callback) {
        const sql = 'SELECT * FROM tipo_letra WHERE LOWER(nombre) = LOWER(?)';
        
        db.pool.query(sql, [nombre], (err, results) => {
            if (err) {
                console.error('Error in DAOTipoLetra.findByName:', err);
                return callback(err);
            }
            callback(null, results.length > 0 ? results[0] : null);
        });
    }

    update(id, tipoData, callback) {
        const { nombre, descripcion } = tipoData;
        
        if (!nombre || !nombre.trim()) {
            return callback(new Error('Nombre de tipo de letra es requerido'));
        }
        
        const sql = 'UPDATE tipo_letra SET nombre = ?, descripcion = ? WHERE id_tipo_letra = ?';
        
        db.pool.query(sql, [nombre, descripcion, id], (err, result) => {
            if (err) {
                console.error('Error in DAOTipoLetra.update:', err);
                return callback(err);
            }
            
            if (result.affectedRows === 0) {
                return callback(new Error('Tipo de letra no encontrado'));
            }
            
            callback(null, { 
                id_tipo_letra: id,
                nombre,
                descripcion,
                updated: true
            });
        });
    }

    delete(id, callback) {
        const sql = 'DELETE FROM tipo_letra WHERE id_tipo_letra = ?';
        
        db.pool.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error in DAOTipoLetra.delete:', err);
                return callback(err);
            }
            
            if (result.affectedRows === 0) {
                return callback(new Error('Tipo de letra no encontrado'));
            }
            
            callback(null, { 
                id_tipo_letra: id,
                deleted: true 
            });
        });
    }

    getById(id, callback) {
        const sql = 'SELECT * FROM tipo_letra WHERE id_tipo_letra = ?';
        
        db.pool.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Error in DAOTipoLetra.getById:', err);
                return callback(err);
            }
            
            if (results.length === 0) {
                return callback(null, null);
            }
            
            callback(null, results[0]);
        });
    }
}

module.exports = new DAOTipoLetra();