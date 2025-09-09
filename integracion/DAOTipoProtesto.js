const db = require('../config/db');

class DAOTipoProtesto {
    create(tipoData, callback) {
        const { nombre } = tipoData;
        
        if (!nombre || !nombre.trim()) {
            return callback(new Error('Nombre de tipo de protesto es requerido'));
        }
        
        db.pool.query(
            'INSERT INTO tipo_protesto (nombre) VALUES (?)',
            [nombre],
            (err, result) => {
                if (err) {
                    console.error('Error in DAOTipoProtesto.create:', err);
                    return callback(err);
                }
                
                if (!result || !result.insertId) {
                    return callback(new Error('No se pudo obtener ID de tipo de protesto insertado'));
                }
                
                callback(null, { 
                    id_tipo_protesto: result.insertId,
                    nombre
                });
            }
        );
    }

    search(query, callback) {
        const sql = `SELECT * FROM tipo_protesto WHERE nombre LIKE ? ORDER BY nombre`;
        
        db.pool.query(sql, [`%${query}%`], (err, results) => {
            if (err) {
                console.error('Error in DAOTipoProtesto.search:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }

    getAll(callback) {
        const sql = 'SELECT id_tipo_protesto, nombre FROM tipo_protesto ORDER BY nombre';
        db.pool.query(sql, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    findByName(nombre, callback) {
        const sql = 'SELECT * FROM tipo_protesto WHERE LOWER(nombre) = LOWER(?)';
        db.pool.query(sql, [nombre], (err, results) => {
            if (err) return callback(err);
            callback(null, results.length > 0 ? results[0] : null);
        });
    }

    delete(id, callback){
        const sql = 'DELETE FROM tipo_protesto WHERE id_tipo_protesto = ?';
        
        db.pool.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error in DAOTipoProtesto.delete:', err);
                return callback(err);
            }
            
            if (result.affectedRows === 0) {
                return callback(new Error('Tipo de protesto no encontrado'));
            }
            
            callback(null, { 
                id_tipo_protesto: id,
                deleted: true 
            });
        });
    }

    update(id, tipoData, callback) {
        const { nombre } = tipoData;
        
        if (!nombre || !nombre.trim()) {
            return callback(new Error('Nombre de tipo de protesto es requerido'));
        }
        
        const sql = 'UPDATE tipo_protesto SET nombre = ? WHERE id_tipo_protesto = ?';
        
        db.pool.query(sql, [nombre, id], (err, result) => {
            if (err) {
                console.error('Error in DAOTipoProtesto.update:', err);
                return callback(err);
            }
            
            if (result.affectedRows === 0) {
                return callback(new Error('Tipo de protesto no encontrado'));
            }
            
            callback(null, { 
                id_tipo_protesto: parseInt(id),
                nombre
            });
        });
    }

}

module.exports = new DAOTipoProtesto();