const db = require('../config/db');
const Moneda = require('../entidades/Moneda');

class DAOMoneda {
    // CREATE
    create(monedaData, callback) {
        const data = monedaData instanceof Moneda ? 
            monedaData.toDatabase() : monedaData;
            
        db.pool.query(
            'INSERT INTO moneda (nombre_moneda) VALUES (?)',
            [data.nombre_moneda],
            (err, result) => {
                if (err) {
                    console.error('Error in DAOMoneda.create:', err);
                    return callback(err);
                }
                
                const nuevaMoneda = new Moneda({
                    id_moneda: result.insertId,
                    nombre_moneda: data.nombre_moneda
                });
                
                callback(null, nuevaMoneda);
            }
        );
    }

    // READ ALL
    getAll(callback) {
        db.pool.query(
            'SELECT * FROM moneda ORDER BY nombre_moneda',
            (err, results) => {
                if (err) {
                    console.error('Error in DAOMoneda.getAll:', err);
                    return callback(err);
                }
                
                const monedas = results.map(row => Moneda.fromDatabase(row));
                callback(null, monedas);
            }
        );
    }

    // READ ONE
    getById(id, callback) {
        db.pool.query(
            'SELECT * FROM moneda WHERE id_moneda = ?',
            [id],
            (err, results) => {
                if (err) {
                    console.error('Error in DAOMoneda.getById:', err);
                    return callback(err);
                }
                
                if (results.length === 0) {
                    return callback(null, null);
                }
                
                const moneda = Moneda.fromDatabase(results[0]);
                callback(null, moneda);
            }
        );
    }

    // UPDATE
    update(id, monedaData, callback) {
        const data = monedaData instanceof Moneda ? 
            monedaData.toDatabase() : monedaData;
            
        db.pool.query(
            'UPDATE moneda SET nombre_moneda = ? WHERE id_moneda = ?',
            [data.nombre_moneda, id],
            (err, result) => {
                if (err) {
                    console.error('Error in DAOMoneda.update:', err);
                    return callback(err);
                }
                if (result.affectedRows === 0) {
                    return callback({ message: 'Moneda not found' });
                }

                this.getById(id, callback);
            }
        );
    }

    // DELETE
    delete(id, callback) {
        db.pool.query(
            'DELETE FROM moneda WHERE id_moneda = ?',
            [id],
            (err, result) => {
                if (err) {
                    console.error('Error in DAOMoneda.delete:', err);
                    return callback(err);
                }
                if (result.affectedRows === 0) {
                    return callback({ message: 'Moneda not found' });
                }
                callback(null, { success: true });
            }
        );
    }

    // BUSCAR MONEDAS
    searchByName(nombre, callback = () => {}) {
        if (!nombre || typeof nombre !== 'string') {
            return callback(null, []);
        }
    
        const searchQuery = `%${nombre}%`;
        
        db.pool.query(
            `SELECT m.id_moneda, m.nombre_moneda
            FROM moneda m
            WHERE m.nombre_moneda LIKE ?
            ORDER BY 
                CASE WHEN m.nombre_moneda = ? THEN 0
                    WHEN m.nombre_moneda LIKE ? THEN 1
                    ELSE 2
                END,
                m.nombre_moneda ASC
            LIMIT 20`,
            [searchQuery, nombre, `${nombre}%`],
            (err, results) => {
                if (err) {
                    console.error('Error in DAOMoneda.searchByName:', err);
                    return callback(err);
                }
                
                const monedas = results.map(row => Moneda.fromDatabase(row));
                callback(null, monedas);
            }
        );
    }

    // FIND BY NAME
    findByName(nombre, callback) {
        const sql = 'SELECT * FROM moneda WHERE LOWER(nombre_moneda) = LOWER(?)';
        db.pool.query(sql, [nombre], (err, results) => {
            if (err) {
                console.error('Error in DAOMoneda.findByName:', err);
                return callback(err);
            }
            
            if (results.length === 0) {
                return callback(null, null);
            }
            
            const moneda = Moneda.fromDatabase(results[0]);
            callback(null, moneda);
        });
    }

    getByNameNormalized(nombre, cb) {
        const sql = `
            SELECT id_moneda, nombre_moneda
            FROM moneda
            WHERE TRIM(LOWER(nombre_moneda)) = TRIM(LOWER(?))
            LIMIT 1
        `;
        db.pool.query(sql, [nombre], (err, rows) => {
            if (err) return cb(err);
            cb(null, rows[0] || null);
        });
    }

    insert(nombre, cb) {
        const sql = `INSERT INTO moneda (nombre_moneda) VALUES (?)`;
        db.pool.query(sql, [nombre.trim()], (err, result) => {
            if (err) return cb(err);
            cb(null, { id_moneda: result.insertId, nombre_moneda: nombre.trim() });
        });
    }

    createOrGetByName(nombre, cb) {
        const clean = (nombre || '').trim();
        if (!clean) return cb(new Error('Nombre de moneda requerido'));

        this.getByNameNormalized(clean, (err, existing) => {
            if (err) return cb(err);
            if (existing) return cb(null, existing);

            this.insert(clean, (insErr, created) => {
                if (insErr) {
                    if (insErr.code === 'ER_DUP_ENTRY') {
                        return this.getByNameNormalized(clean, cb);
                    }
                    return cb(insErr);
                }
                cb(null, created);
            });
        });
    }
}

module.exports = new DAOMoneda();