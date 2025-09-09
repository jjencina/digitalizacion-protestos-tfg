const db = require('../config/db');
const Persona = require('../entidades/Persona');

class DAOPersona {
    // CREATE
    create(personaData, callback) {
        const data = personaData instanceof Persona ? 
            personaData.toDatabase() : personaData;
            
        const query = 'INSERT INTO persona (nombre, apellidos, fecha_nacimiento, pais, fecha_muerte) VALUES (?, ?, ?, ?, ?)';
        const values = [
            data.nombre, 
            data.apellidos, 
            data.fecha_nacimiento, 
            data.pais, 
            data.fecha_muerte
        ];

        db.pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error in DAOPersona.create:', err);
                return callback(err);
            }
            const nuevaPersona = new Persona({
                id_persona: result.insertId,
                nombre: data.nombre,
                apellidos: data.apellidos,
                fecha_nacimiento: data.fecha_nacimiento,
                pais: data.pais,
                fecha_muerte: data.fecha_muerte
            });
            
            callback(null, nuevaPersona);
        });
    }

    getAll(callback) {
        db.pool.query(
            'SELECT * FROM persona ORDER BY nombre',
            (err, results) => {
                if (err) {
                    console.error('Error in DAOPersona.getAll:', err);
                    return callback(err);
                }
                
                const personas = results.map(row => Persona.fromDatabase(row));
                callback(null, personas);
            }
        );
    }

    // READ ONE
    getById(id, callback) {
        db.pool.query(
            'SELECT * FROM persona WHERE id_persona = ?',
            [id],
            (err, results) => {
                if (err) {
                    console.error('Error in DAOPersona.getById:', err);
                    return callback(err);
                }
                
                if (results.length === 0) {
                    return callback(null, null);
                }
                
                const persona = Persona.fromDatabase(results[0]);
                callback(null, persona);
            }
        );
    }

    // UPDATE
    update(id, personaData, callback) {
        const data = personaData instanceof Persona ? 
            personaData.toDatabase() : personaData;
            
        const query = 'UPDATE persona SET nombre = ?, apellidos = ?, fecha_nacimiento = ?, pais = ?, fecha_muerte = ? WHERE id_persona = ?';
        const values = [
            data.nombre, 
            data.apellidos, 
            data.fecha_nacimiento, 
            data.pais, 
            data.fecha_muerte, 
            id
        ];

        db.pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error in DAOPersona.update:', err);
                return callback(err);
            }
            if (result.affectedRows === 0) {
                return callback({ message: 'Persona not found' });
            }
            this.getById(id, callback);
        });
    }

    // DELETE
    delete(id, callback) {
        db.pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error conexión pool:', err);
                return callback(err);
            }

            // Inicia la transacción: o se hace todo, o no se hace nada
            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    return callback(err);
                }

                // Verifica si la persona está referenciada en tablas relacionadas y si las hay, no permitimos borrar para mantener integridad referencial.
                const checkQuery = `SELECT 
                        (SELECT COUNT(*) FROM protesto_roles WHERE id_persona = ?) AS protesto_count,
                        (SELECT COUNT(*) FROM letra_roles    WHERE id_persona = ?) AS letra_count,
                        (SELECT COUNT(*) FROM endoso_roles   WHERE id_persona = ?) AS endoso_count`;

                connection.query(checkQuery, [id, id, id], (err, results) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(err);
                        });
                    }

                    const { protesto_count, letra_count, endoso_count } = results[0];
                    // Si tiene referencias activas hacemos rollback
                    if (protesto_count > 0 || letra_count > 0 || endoso_count > 0) {
                        return connection.rollback(() => {
                            connection.release();
                            callback({message: 'No se puede borrar una persona con referencias'});
                        });
                    }

                    // Sin referencias: procede a eliminar la persona
                    connection.query('DELETE FROM persona WHERE id_persona = ?', [id], (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(err);
                            });
                        }
                        
                        // Si no se afectó ninguna fila rollback
                        if (result.affectedRows === 0) {
                            return connection.rollback(() => {
                                connection.release();
                                callback({ message: 'Persona not found' });
                            });
                        }
                        // Exito realizar transacción
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
    }

    // SEARCH
    search(query, callback) {
        const searchQuery = `%${query}%`;
        db.pool.query(
            'SELECT * FROM persona WHERE nombre LIKE ? OR apellidos LIKE ? OR pais LIKE ? ORDER BY nombre',
            [searchQuery, searchQuery, searchQuery],
            (err, results) => {
                if (err) {
                    console.error('Error in DAOPersona.search:', err);
                    return callback(err);
                }
                
                const personas = results.map(row => Persona.fromDatabase(row));
                callback(null, personas);
            }
        );
    }
}

module.exports = new DAOPersona();