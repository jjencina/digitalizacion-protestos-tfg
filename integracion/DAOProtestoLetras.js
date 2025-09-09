const db = require('../config/db');

class DAOProtestoLetras {
    getAll(callback) {
        const query = `
            SELECT pl.id_letra, pl.id_protesto, 
                   p.fecha_protesto,
                   p.motivo AS motivo_protesto,
                   c.nombre_ciudad AS ciudad_protesto,
                   l.fecha_letra,
                   l.importe AS importe_letra,
                   l.fecha_vencimiento,
                   m.nombre_moneda AS moneda_letra,
                   tl.nombre AS tipo_letra_nombre
            FROM protesto_letra pl
            JOIN protesto p ON pl.id_protesto = p.id_protesto
            JOIN letracambio l ON pl.id_letra = l.id_letra
            LEFT JOIN ciudad c ON p.id_ciudad = c.id_ciudad
            LEFT JOIN moneda m ON l.id_moneda = m.id_moneda
            LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
            ORDER BY pl.id_protesto DESC, pl.id_letra DESC`;
        
        db.pool.query(query, (err, results) => {
            if (err) {
                console.error('Error in DAOProtestoLetras.getAll:', err);
                return callback(err);
            }
            
            // Procesamos los resultados y creamos un campo id_relacion sintético
            const processedResults = results.map(row => {
                return {
                    id_relacion: `${row.id_protesto}-${row.id_letra}`,
                    id_protesto: row.id_protesto,
                    fecha_protesto: row.fecha_protesto,
                    motivo_protesto: row.motivo_protesto,
                    ciudad_protesto: row.ciudad_protesto,
                    id_letra: row.id_letra,
                    fecha_letra: row.fecha_letra,
                    importe_letra: row.importe_letra,
                    fecha_vencimiento: row.fecha_vencimiento,
                    moneda_letra: row.moneda_letra,
                    tipo_letra_nombre: row.tipo_letra_nombre,
                    protesto_detalles: `Fecha: ${new Date(row.fecha_protesto).toLocaleDateString()}, Ciudad: ${row.ciudad_protesto || 'N/A'}`,
                    letra_detalles: `Fecha: ${new Date(row.fecha_letra).toLocaleDateString()}, Importe: ${row.importe_letra} ${row.moneda_letra || ''}`
                };
            });
            
            callback(null, processedResults);
        });
    }

    // Obtener una relación por ID
    getById(id, callback) {
        // Como no tenemos un ID real en la tabla, vamos a parsear el ID sintético que tiene formato 'id_protesto-id_letra'
        let id_protesto, id_letra;
        try {
            [id_protesto, id_letra] = id.split('-').map(Number);
        } catch (err) {
            return callback(new Error('ID de relación inválido'));
        }
        
        const query = `
            SELECT pl.id_letra, pl.id_protesto, 
                   p.fecha_protesto,
                   p.motivo AS motivo_protesto,
                   c.nombre_ciudad AS ciudad_protesto,
                   l.fecha_letra,
                   l.importe AS importe_letra,
                   l.fecha_vencimiento,
                   m.nombre_moneda AS moneda_letra,
                   tl.nombre AS tipo_letra_nombre
            FROM protesto_letra pl
            JOIN protesto p ON pl.id_protesto = p.id_protesto
            JOIN letracambio l ON pl.id_letra = l.id_letra
            LEFT JOIN ciudad c ON p.id_ciudad = c.id_ciudad
            LEFT JOIN moneda m ON l.id_moneda = m.id_moneda
            LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
            WHERE pl.id_protesto = ? AND pl.id_letra = ?`;
        
        db.pool.query(query, [id_protesto, id_letra], (err, results) => {
            if (err) {
                console.error('Error in DAOProtestoLetras.getById:', err);
                return callback(err);
            }
            
            if (results.length === 0) {
                return callback(null, null);
            }
            
            const row = results[0];
            const result = {
                id_relacion: `${row.id_protesto}-${row.id_letra}`,
                id_protesto: row.id_protesto,
                fecha_protesto: row.fecha_protesto,
                motivo_protesto: row.motivo_protesto,
                ciudad_protesto: row.ciudad_protesto,
                id_letra: row.id_letra,
                fecha_letra: row.fecha_letra,
                importe_letra: row.importe_letra,
                fecha_vencimiento: row.fecha_vencimiento,
                moneda_letra: row.moneda_letra,
                tipo_letra_nombre: row.tipo_letra_nombre,
                protesto_detalles: `Fecha: ${new Date(row.fecha_protesto).toLocaleDateString()}, Ciudad: ${row.ciudad_protesto || 'N/A'}`,
                letra_detalles: `Fecha: ${new Date(row.fecha_letra).toLocaleDateString()}, Importe: ${row.importe_letra} ${row.moneda_letra || ''}`
            };
            
            callback(null, result);
        });
    }

    // Crear una nueva relación
    create(data, callback) {
        const { id_protesto, id_letra } = data;
        
        // Verificar que no exista ya la relación
        this.findExisting(id_protesto, id_letra, (err, existing) => {
            if (err) return callback(err);
            
            if (existing) {
                return callback(new Error('Esta relación ya existe'));
            }
            
            const query = 'INSERT INTO protesto_letra (id_protesto, id_letra) VALUES (?, ?)';
            
            db.pool.query(query, [id_protesto, id_letra], (err, result) => {
                if (err) {
                    console.error('Error in DAOProtestoLetras.create:', err);
                    return callback(err);
                }
                
                this.getById(`${id_protesto}-${id_letra}`, callback);
            });
        });
    }

    // Buscar una relación existente
    findExisting(id_protesto, id_letra, callback) {
        const query = 'SELECT * FROM protesto_letra WHERE id_protesto = ? AND id_letra = ?';
        
        db.pool.query(query, [id_protesto, id_letra], (err, results) => {
            if (err) {
                console.error('Error in DAOProtestoLetras.findExisting:', err);
                return callback(err);
            }
            callback(null, results[0] || null);
        });
    }

    // Actualizar una relación existente
    update(id, data, callback) {
        // Parsear el ID sintético
        let currentId_protesto, currentId_letra;
        try {
            [currentId_protesto, currentId_letra] = id.split('-').map(Number);
        } catch (err) {
            return callback(new Error('ID de relación inválido'));
        }
        
        const { id_protesto, id_letra } = data;
        
        // Verificar que no exista ya otra relación con los mismos ids
        if (currentId_protesto === id_protesto && currentId_letra === id_letra) {
            // Si no hay cambios devolver la relación actual
            return this.getById(id, callback);
        }
        
        this.findExisting(id_protesto, id_letra, (err, existing) => {
            if (err) return callback(err);
            
            if (existing) {
                return callback(new Error('Esta relación ya existe con otro ID'));
            }
            
            // Primero eliminamos la relación actual
            db.pool.query('DELETE FROM protesto_letra WHERE id_protesto = ? AND id_letra = ?', 
                [currentId_protesto, currentId_letra], (err) => {
                if (err) {
                    console.error('Error eliminando relación actual:', err);
                    return callback(err);
                }
                
                // Luego creamos la nueva relación
                db.pool.query('INSERT INTO protesto_letra (id_protesto, id_letra) VALUES (?, ?)', 
                    [id_protesto, id_letra], (err) => {
                    if (err) {
                        console.error('Error creando nueva relación:', err);
                        return callback(err);
                    }
                    
                    this.getById(`${id_protesto}-${id_letra}`, callback);
                });
            });
        });
    }

    // Eliminar una relación
    delete(id, callback) {
        // Parsear el ID sintético
        let id_protesto, id_letra;
        try {
            [id_protesto, id_letra] = id.split('-').map(Number);
        } catch (err) {
            return callback(new Error('ID de relación inválido'));
        }
        
        const query = 'DELETE FROM protesto_letra WHERE id_protesto = ? AND id_letra = ?';
        
        db.pool.query(query, [id_protesto, id_letra], (err, result) => {
            if (err) {
                console.error('Error in DAOProtestoLetras.delete:', err);
                return callback(err);
            }
            
            callback(null, { 
                success: true, 
                id_relacion: id, 
                id_protesto, 
                id_letra, 
                affectedRows: result.affectedRows 
            });
        });
    }

    // Obtener letras relacionadas con un protesto
    getLetrasByProtesto(protestoId, callback) {
        const query = `
            SELECT l.*, m.nombre_moneda, tl.nombre AS tipo_letra_nombre  
            FROM letracambio l
            JOIN protesto_letra pl ON l.id_letra = pl.id_letra
            LEFT JOIN moneda m ON l.id_moneda = m.id_moneda
            LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
            WHERE pl.id_protesto = ?
            ORDER BY l.fecha_letra`;
        
        db.pool.query(query, [protestoId], (err, results) => {
            if (err) {
                console.error('Error in DAOProtestoLetras.getLetrasByProtesto:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }

    // Obtener protestos relacionados con una letra
    getProtestosByLetra(letraId, callback) {
        const query = `
            SELECT p.*, c.nombre_ciudad, tp.nombre AS tipo_protesto_nombre, tl.nombre AS tipo_letra_protesto_nombre
            FROM protesto p
            JOIN protesto_letra pl ON p.id_protesto = pl.id_protesto
            LEFT JOIN ciudad c ON p.id_ciudad = c.id_ciudad
            LEFT JOIN tipo_protesto tp ON p.id_tipo_protesto = tp.id_tipo_protesto
            LEFT JOIN tipo_letra tl ON p.id_tipo_letra_protesto = tl.id_tipo_letra
            WHERE pl.id_letra = ?
            ORDER BY p.fecha_protesto DESC`;
        
        db.pool.query(query, [letraId], (err, results) => {
            if (err) {
                console.error('Error in DAOProtestoLetras.getProtestosByLetra:', err);
                return callback(err);
            }
            callback(null, results);
        });
    }
}

module.exports = new DAOProtestoLetras();