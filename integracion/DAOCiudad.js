const db = require('../config/db');
const Ciudad = require('../entidades/Ciudad');

class DAOCiudad {
    // CREATE
    create(ciudadData, callback = () => {}) {
        const data = ciudadData instanceof Ciudad ? ciudadData.toDatabase() : ciudadData;
            
        db.pool.query(
            'INSERT INTO ciudad (nombre_ciudad, pais, latitud, longitud) VALUES (?, ?, ?, ?)', 
            [data.nombre_ciudad, data.pais, data.latitud, data.longitud], 
            (err, results) => {
                if (err) {
                    console.error('Error in DAOCiudad.create:', err);
                    return callback(err);
                }

                const nuevaCiudad = new Ciudad({
                    id_ciudad: results.insertId,
                    nombre_ciudad: data.nombre_ciudad,
                    pais: data.pais,
                    latitud: data.latitud,
                    longitud: data.longitud
                });
                
                callback(null, nuevaCiudad);
            }
        );
    }

    // READ ALL
    getAll(callback = () => {}) {
        db.pool.query(
            'SELECT * FROM ciudad ORDER BY nombre_ciudad', 
            (err, results) => {
                if (err) {
                    console.error('Error in DAOCiudad.getAll:', err);
                    return callback(err);
                }
                
                const ciudades = results.map(row => Ciudad.fromDatabase(row));
                callback(null, ciudades);
            }
        );
    }

    // READ ALL con coords
    getAllWithCoordinates(callback = () => {}) {
        db.pool.query(
            'SELECT * FROM ciudad WHERE latitud IS NOT NULL AND longitud IS NOT NULL ORDER BY nombre_ciudad', 
            (err, results) => {
                if (err) {
                    console.error('Error in DAOCiudad.getAllWithCoordinates:', err);
                    return callback(err);
                }
                
                const ciudades = results.map(row => Ciudad.fromDatabase(row));
                callback(null, ciudades);
            }
        );
    }

    // READ ONE
    getById(id, callback = () => {}) {
        db.pool.query(
            'SELECT * FROM ciudad WHERE id_ciudad = ?', 
            [id], 
            (err, results) => {
                if (err) {
                    console.error('Error in DAOCiudad.getById:', err);
                    return callback(err);
                }
                
                if (results.length === 0) {
                    return callback(null, null);
                }
                
                const ciudad = Ciudad.fromDatabase(results[0]);
                callback(null, ciudad);
            }
        );
    }

    // UPDATE
    update(id, ciudadData, callback = () => {}) {
        const data = ciudadData instanceof Ciudad ? ciudadData.toDatabase() : ciudadData;

        db.pool.query(
            'UPDATE ciudad SET nombre_ciudad = ?, pais = ?, latitud = ?, longitud = ? WHERE id_ciudad = ?',
            [data.nombre_ciudad, data.pais, data.latitud, data.longitud, id],
            (err, results) => {
                if (err) return callback(err);

                if (results.affectedRows === 0) {
                    return callback(null, null);
                }

                this.getById(id, (err2, ciudad) => {
                    if (err2) return callback(err2);
                    callback(null, ciudad);
                });
            }
        );
    }

    // DELETE
    delete(id, callback = () => {}) {
        db.pool.query(
            'DELETE FROM ciudad WHERE id_ciudad = ?',
            [id],
            (err, results) => {
                if (err) return callback(err);
                callback(null, { affectedRows: results.affectedRows });
            }
        );
    }

    // SEARCH BY NAME
    searchByName(nombre, callback = () => {}) {
        if (!nombre || typeof nombre !== 'string') {
            return callback(null, []);
        }

        const searchQuery = `%${nombre}%`;
        
        db.pool.query(
            `SELECT c.id_ciudad, c.nombre_ciudad, c.pais
            FROM ciudad c
            WHERE c.nombre_ciudad LIKE ? OR c.pais LIKE ?
            ORDER BY 
                CASE WHEN c.nombre_ciudad = ? THEN 0
                    WHEN c.nombre_ciudad LIKE ? THEN 1
                    ELSE 2
                END,
                c.nombre_ciudad ASC
            LIMIT 20`,
            [searchQuery, searchQuery, nombre, `${nombre}%`],
            (err, results) => {
                if (err) {
                    console.error('Error in DAOCiudad.searchByName:', err);
                    return callback(err);
                }

                const ciudades = results.map(row => Ciudad.fromDatabase(row));
                callback(null, ciudades);
            }
        );
    }

    // FIND BY NAME
    findByName(nombreCiudad, pais, callback) {
        const sql = 'SELECT * FROM ciudad WHERE LOWER(nombre_ciudad) = LOWER(?) AND LOWER(pais) = LOWER(?)';
        db.pool.query(sql, [nombreCiudad, pais], (err, results) => {
            if (err) {
                console.error('Error in DAOCiudad.findByName:', err);
                return callback(err);
            }
            
            if (results.length === 0) {
                return callback(null, null);
            }
            
            const ciudad = Ciudad.fromDatabase(results[0]);
            callback(null, ciudad);
        });
    }

    // CHECK IF EXISTS
    exists(id, callback = () => {}) {
        db.pool.query(
            'SELECT COUNT(*) as count FROM ciudad WHERE id_ciudad = ?',
            [id],
            (err, results) => {
                if (err) {
                    console.error('Error in DAOCiudad.exists:', err);
                    return callback(err);
                }
                callback(null, results[0].count > 0);
            }
        );
    }

    // Obtener estadísticas de ciudades para el mapa
    getCityStatistics(callback = () => {}) {
        const query = `
            SELECT 
                c.id_ciudad,
                c.nombre_ciudad,
                c.pais,
                c.latitud,
                c.longitud,
                COUNT(DISTINCT p.id_protesto) as total_protestos,
                COUNT(DISTINCT l.id_letra) as total_letras,
                COUNT(DISTINCT e.id_endoso) as total_endosos,
                COALESCE(SUM(l.importe), 0) as total_importe
            FROM ciudad c
            LEFT JOIN protesto p ON c.id_ciudad = p.id_ciudad
            LEFT JOIN letracambio l ON c.id_ciudad = l.id_ciudad
            LEFT JOIN endoso e ON c.id_ciudad = e.id_ciudad
            WHERE c.latitud IS NOT NULL AND c.longitud IS NOT NULL
            GROUP BY c.id_ciudad, c.nombre_ciudad, c.pais, c.latitud, c.longitud
            HAVING (total_protestos > 0 OR total_letras > 0 OR total_endosos > 0)
            ORDER BY total_importe DESC`;

        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOCiudad.getCityStatistics:', err);
                return callback(err);
            }
            
            callback(null, results);
        });
    }

    // Obtener conexiones entre ciudades basadas en relaciones comerciales
    getCityConnections(callback = () => {}) {
        const query = `
            SELECT 
                c1.id_ciudad as id_ciudad_origen,
                c1.nombre_ciudad as ciudad_origen,
                c1.latitud as lat_origen,
                c1.longitud as lng_origen,
                c2.id_ciudad as id_ciudad_destino,
                c2.nombre_ciudad as ciudad_destino,
                c2.latitud as lat_destino,
                c2.longitud as lng_destino,
                COUNT(*) as total_conexiones,
                'protesto' as tipo_conexion
            FROM protesto p
            JOIN ciudad c1 ON p.id_ciudad = c1.id_ciudad
            JOIN protesto_letra pl ON p.id_protesto = pl.id_protesto
            JOIN letracambio l ON pl.id_letra = l.id_letra
            JOIN ciudad c2 ON l.id_ciudad = c2.id_ciudad
            WHERE c1.id_ciudad != c2.id_ciudad
              AND c1.latitud IS NOT NULL AND c1.longitud IS NOT NULL
              AND c2.latitud IS NOT NULL AND c2.longitud IS NOT NULL
            GROUP BY c1.id_ciudad, c2.id_ciudad, c1.nombre_ciudad, c2.nombre_ciudad,
                     c1.latitud, c1.longitud, c2.latitud, c2.longitud
            
            UNION ALL
            
            SELECT 
                c1.id_ciudad as id_ciudad_origen,
                c1.nombre_ciudad as ciudad_origen,
                c1.latitud as lat_origen,
                c1.longitud as lng_origen,
                c2.id_ciudad as id_ciudad_destino,
                c2.nombre_ciudad as ciudad_destino,
                c2.latitud as lat_destino,
                c2.longitud as lng_destino,
                COUNT(*) as total_conexiones,
                'letra' as tipo_conexion
            FROM letracambio l1
            JOIN ciudad c1 ON l1.id_ciudad = c1.id_ciudad
            JOIN letra_endoso le ON l1.id_letra = le.id_letra
            JOIN endoso e ON le.id_endoso = e.id_endoso
            JOIN ciudad c2 ON e.id_ciudad = c2.id_ciudad
            WHERE c1.id_ciudad != c2.id_ciudad
              AND c1.latitud IS NOT NULL AND c1.longitud IS NOT NULL
              AND c2.latitud IS NOT NULL AND c2.longitud IS NOT NULL
            GROUP BY c1.id_ciudad, c2.id_ciudad, c1.nombre_ciudad, c2.nombre_ciudad,
                     c1.latitud, c1.longitud, c2.latitud, c2.longitud
            
            ORDER BY total_conexiones DESC`;

        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOCiudad.getCityConnections:', err);
                return callback(err);
            }
            
            try {
                // Gestionar conexiones bidireccionales
                const connectionMap = new Map();
                
                results.forEach(connection => {
                    const key1 = `${connection.id_ciudad_origen}-${connection.id_ciudad_destino}`;
                    const key2 = `${connection.id_ciudad_destino}-${connection.id_ciudad_origen}`;
                    
                    if (connectionMap.has(key2)) {
                        // Ya existe la conexión inversa asique sumar las conexiones
                        const existing = connectionMap.get(key2);
                        existing.total_conexiones += connection.total_conexiones;
                    } else {
                        // Nueva conexión
                        connectionMap.set(key1, connection);
                    }
                });
                
                console.log('Conexiones encontradas:', connectionMap.size);
                callback(null, Array.from(connectionMap.values()));
            } catch (error) {
                console.error('Error procesando conexiones:', error);
                callback(error);
            }
        });
    }
}

module.exports = DAOCiudad;