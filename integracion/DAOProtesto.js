const db = require('../config/db');

class DAOProtesto {
  
  insertProtestoRol(protestoId, rol, callback) {
    db.pool.query(
      'INSERT INTO protesto_roles (id_protesto, id_ciudad, id_persona, id_rol) VALUES (?, ?, ?, ?)',
      [protestoId, rol.id_ciudad, rol.id_persona, rol.id_rol],
      (err, results) => {
        if (err) {
          console.error('Error in insertProtestoRol:', err);
          return callback(err);
        }
        callback(null, results);
      }
    );
  }
  
  insertLetra(letra, callback) {
    db.pool.query(
      `INSERT INTO letracambio (
        fecha_letra, fecha_vencimiento, importe, id_moneda, 
        id_tipo_valor, id_tipo_plazo, id_tipo_letra, 
        plazo_dias, id_ciudad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        letra.fecha_letra,
        letra.fecha_vencimiento, 
        letra.importe,
        letra.id_moneda,
        letra.id_tipo_valor,
        letra.id_tipo_plazo,
        letra.id_tipo_letra,
        letra.plazo_dias || 0,
        letra.id_ciudad
      ],
      (err, results) => {
        if (err) {
          console.error('Error in insertLetra:', err);
          return callback(err);
        }
        callback(null, results);
      }
    );
  }
  
  insertProtestoLetra(protestoId, letraId, callback) {
    db.pool.query(
      'INSERT INTO protesto_letra (id_letra, id_protesto) VALUES (?, ?)',
      [letraId, protestoId],
      (err, results) => {
        if (err) {
          console.error('Error in insertProtestoLetra:', err);
          return callback(err);
        }
        callback(null, results);
      }
    );
  }
  
  insertLetraRol(letraId, rol, callback) {
    db.pool.query(
      'INSERT INTO letra_roles (id_letra, id_ciudad, id_persona, id_rol) VALUES (?, ?, ?, ?)',
      [letraId, rol.id_ciudad, rol.id_persona, rol.id_rol],
      (err, results) => {
        if (err) {
          console.error('Error in insertLetraRol:', err);
          return callback(err);
        }
        callback(null, results);
      }
    );
  }
  
  insertLetraEndoso(letraId, endosoId, callback) {
    db.pool.query(
      'INSERT INTO letra_endoso (id_letra, id_endoso) VALUES (?, ?)',
      [letraId, endosoId],
      (err, results) => {
        if (err) {
          console.error('Error in insertLetraEndoso:', err);
          return callback(err);
        }
        callback(null, results);
      }
    );
  }
  
  insertEndoso(endoso, callback) {
    db.pool.query(
      'INSERT INTO endoso (fecha_endoso, valor, id_moneda, id_tipo_negociacion, id_ciudad) VALUES (?, ?, ?, ?, ?)',
      [
        endoso.fecha_endoso || endoso.fecha || null,
        endoso.valor || null,
        endoso.id_moneda || endoso.moneda_id || null,
        endoso.id_tipo_negociacion || endoso.tipo_negociacion_id || null,
        endoso.id_ciudad || endoso.ciudad_id || null
      ],
      (err, results) => {
        if (err) {
          console.error('Error in insertEndoso:', err);
          return callback(err);
        }
        callback(null, results);
      }
    );
  }

  getAll(callback) {
    const query = `
    SELECT DISTINCT
        p.*, 
        p.archivo, p.protocolo, p.pagina,
        p.id_tipo_letra, tpl.nombre as tipo_letra_protesto_nombre,
        p.id_tipo_protesto, tpr.nombre as tipo_protesto_nombre,
        p.texto_abono,
        p.id_ciudad as protesto_ciudad_id, 
        ciudad_p.nombre_ciudad as protesto_ciudad_nombre,
        
        l.id_letra, l.fecha_letra, l.fecha_vencimiento, l.importe as importe_letra,
        l.plazo_dias, l.id_tipo_letra as letra_tipo_letra_id, 
        tl.nombre as letra_tipo_letra_nombre,
        l.id_ciudad as letra_ciudad_id, 
        ciudad_l.nombre_ciudad as letra_ciudad_nombre,
        
        ml.nombre_moneda as moneda_letra,
        tl.nombre as tipo_letra_nombre, tl.id_tipo_letra,
        tv.nombre as tipo_valor_nombre, tv.id_tipo_valor,
        tpz.nombre as tipo_plazo_nombre, tpz.id_tipo_plazo,
        
        e.id_endoso, e.fecha_endoso, e.valor as valor_endoso,
        e.id_ciudad as endoso_ciudad_id, 
        ciudad_e.nombre_ciudad as endoso_ciudad_nombre,
        
        me.nombre_moneda as moneda_endoso,
        tn.nombre as tipo_negociacion_nombre, tn.id_tipo_negociacion,
        
        r.id_rol as rol_protesto_id, rn.nombre_rol as rol_protesto_nombre,
        per.id_persona as persona_protesto_id, per.nombre as persona_protesto_nombre,
        ciudad_pr.id_ciudad as ciudad_protesto_rol_id, 
        ciudad_pr.nombre_ciudad as ciudad_protesto_rol_nombre,
        
        lr.id_rol as rol_letra_id, lrn.nombre_rol as rol_letra_nombre,
        lper.id_persona as persona_letra_id, lper.nombre as persona_letra_nombre,
        ciudad_lr.id_ciudad as ciudad_letra_rol_id, 
        ciudad_lr.nombre_ciudad as ciudad_letra_rol_nombre,
        
        er.id_rol as rol_endoso_id, ern.nombre_rol as rol_endoso_nombre,
        eper.id_persona as persona_endoso_id, eper.nombre as persona_endoso_nombre,
        ciudad_er.id_ciudad as ciudad_endoso_rol_id,
        ciudad_er.nombre_ciudad as ciudad_endoso_rol_nombre
    FROM protesto p
    LEFT JOIN ciudad ciudad_p ON p.id_ciudad = ciudad_p.id_ciudad
    LEFT JOIN tipo_letra tpl ON p.id_tipo_letra = tpl.id_tipo_letra  
    LEFT JOIN tipo_protesto tpr ON p.id_tipo_protesto = tpr.id_tipo_protesto
    
    LEFT JOIN protesto_roles pr ON p.id_protesto = pr.id_protesto
    LEFT JOIN rol r ON pr.id_rol = r.id_rol
    LEFT JOIN rol_nombres rn ON r.id_rol = rn.id_rol
    LEFT JOIN persona per ON pr.id_persona = per.id_persona
    LEFT JOIN ciudad ciudad_pr ON pr.id_ciudad = ciudad_pr.id_ciudad
    
    LEFT JOIN protesto_letra pl ON p.id_protesto = pl.id_protesto
    LEFT JOIN letracambio l ON pl.id_letra = l.id_letra
    LEFT JOIN ciudad ciudad_l ON l.id_ciudad = ciudad_l.id_ciudad
    LEFT JOIN moneda ml ON l.id_moneda = ml.id_moneda
    LEFT JOIN tipo_letra tl ON l.id_tipo_letra = tl.id_tipo_letra
    LEFT JOIN tipo_valor tv ON l.id_tipo_valor = tv.id_tipo_valor
    LEFT JOIN tipo_plazo tpz ON l.id_tipo_plazo = tpz.id_tipo_plazo
    
    LEFT JOIN letra_roles lr ON l.id_letra = lr.id_letra
    LEFT JOIN rol lr2 ON lr.id_rol = lr2.id_rol
    LEFT JOIN rol_nombres lrn ON lr2.id_rol = lrn.id_rol
    LEFT JOIN persona lper ON lr.id_persona = lper.id_persona
    LEFT JOIN ciudad ciudad_lr ON lr.id_ciudad = ciudad_lr.id_ciudad
    
    LEFT JOIN letra_endoso le ON l.id_letra = le.id_letra
    LEFT JOIN endoso e ON le.id_endoso = e.id_endoso
    LEFT JOIN ciudad ciudad_e ON e.id_ciudad = ciudad_e.id_ciudad
    LEFT JOIN moneda me ON e.id_moneda = me.id_moneda
    LEFT JOIN tipo_negociacion tn ON e.id_tipo_negociacion = tn.id_tipo_negociacion
    
    LEFT JOIN endoso_roles er ON e.id_endoso = er.id_endoso
    LEFT JOIN rol er2 ON er.id_rol = er2.id_rol
    LEFT JOIN rol_nombres ern ON er2.id_rol = ern.id_rol
    LEFT JOIN persona eper ON er.id_persona = eper.id_persona
    LEFT JOIN ciudad ciudad_er ON er.id_ciudad = ciudad_er.id_ciudad
    
    ORDER BY p.id_protesto, l.id_letra, e.id_endoso;`;

    db.pool.query(query, (err, results) => {
      if (err) {
        console.error('Error in DAOProtesto.getAll:', err);
        return callback(err);
      }

      const protestos = {};   
      results.forEach(row => {
          if (!protestos[row.id_protesto]) {
            protestos[row.id_protesto] = {
              id_protesto: row.id_protesto,
              fecha_protesto: row.fecha_protesto,
              archivo: row.archivo,
              protocolo: row.protocolo, 
              pagina: row.pagina,
              tipo_letra_protesto_nombre: row.tipo_letra_protesto_nombre,
              tipo_protesto_nombre: row.tipo_protesto_nombre,
              id_tipo_letra: row.id_tipo_letra,
              id_tipo_protesto: row.id_tipo_protesto,
              texto_abono: row.texto_abono,
              importe: row.importe,
              motivo: row.motivo,
              introduccion: row.introduccion,
              fuente: row.fuente,
              id_ciudad: row.protesto_ciudad_id,
              ciudad_nombre: row.protesto_ciudad_nombre,
              roles: [],
              letras: {}
            };
          }

          // 2. Añadir roles del protesto 
          if (row.rol_protesto_id && !protestos[row.id_protesto].roles.some(r => r.id_rol === row.rol_protesto_id)) {
            protestos[row.id_protesto].roles.push({
              id_rol: row.rol_protesto_id,
              nombre_rol: row.rol_protesto_nombre,
              id_persona: row.persona_protesto_id,
              nombre_persona: row.persona_protesto_nombre,
              id_ciudad: row.ciudad_protesto_rol_id,
              nombre_ciudad: row.ciudad_protesto_rol_nombre
            });
          }

          // 3. Crear letra
          if (row.id_letra && !protestos[row.id_protesto].letras[row.id_letra]) {
            protestos[row.id_protesto].letras[row.id_letra] = {
              id_letra: row.id_letra,
              fecha_letra: row.fecha_letra,
              fecha_vencimiento: row.fecha_vencimiento,
              importe: row.importe_letra,
              moneda_nombre: row.moneda_letra,
              tipo_letra_nombre: row.letra_tipo_letra_nombre,
              id_tipo_letra: row.letra_tipo_letra_id,
              tipo_valor: row.tipo_valor_nombre,
              tipo_plazo: row.tipo_plazo_nombre,
              id_tipo_valor: row.id_tipo_valor,
              id_tipo_plazo: row.id_tipo_plazo,
              plazo_dias: row.plazo_dias,
              id_ciudad: row.letra_ciudad_id,
              ciudad_nombre: row.letra_ciudad_nombre,
              roles: [],
              endosos: {}
            };
          }

          // 4. Añadir roles de la letra
          if (row.id_letra && row.rol_letra_id && 
            !protestos[row.id_protesto].letras[row.id_letra].roles.some(r => r.id_rol === row.rol_letra_id)) {
            protestos[row.id_protesto].letras[row.id_letra].roles.push({
              id_rol: row.rol_letra_id,
              nombre_rol: row.rol_letra_nombre,
              id_persona: row.persona_letra_id,
              nombre_persona: row.persona_letra_nombre,
              id_ciudad: row.ciudad_letra_rol_id,
              nombre_ciudad: row.ciudad_letra_rol_nombre
            });
          }

          // 5. Crear endoso
          if (row.id_endoso && row.id_letra && 
            !protestos[row.id_protesto].letras[row.id_letra].endosos[row.id_endoso]) {
            protestos[row.id_protesto].letras[row.id_letra].endosos[row.id_endoso] = {
              id_endoso: row.id_endoso,
              fecha_endoso: row.fecha_endoso,
              valor: row.valor_endoso,
              moneda_nombre: row.moneda_endoso,
              tipo_negociacion_nombre: row.tipo_negociacion_nombre,
              id_tipo_negociacion: row.id_tipo_negociacion,
              id_ciudad: row.endoso_ciudad_id,
              ciudad_nombre: row.endoso_ciudad_nombre,
              roles: []
            };
          }

          // 6. Añadir roles del endoso
          if (row.id_endoso && row.id_letra && row.rol_endoso_id && 
            !protestos[row.id_protesto].letras[row.id_letra].endosos[row.id_endoso].roles.some(
              r => r.id_rol === row.rol_endoso_id && r.id_persona === row.persona_endoso_id
            )) {
            protestos[row.id_protesto].letras[row.id_letra].endosos[row.id_endoso].roles.push({
              id_rol: row.rol_endoso_id,
              nombre_rol: row.rol_endoso_nombre,
              id_persona: row.persona_endoso_id,
              nombre_persona: row.persona_endoso_nombre,
              id_ciudad: row.ciudad_endoso_rol_id,
              nombre_ciudad: row.ciudad_endoso_rol_nombre
            });
          }
      });

      // 7. Objeto a Array
      const protestosArray = Object.values(protestos).map(p => {
        p.letras = Object.values(p.letras).map(l => {
          l.endosos = Object.values(l.endosos);
          return l;
        });
        return p;
      });

      callback(null, protestosArray);
    });
  }

  delete(id, callback) {
    db.pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection for delete operation:', err);
        return callback(err);
      }

      connection.beginTransaction(err => {
        if (err) {
          connection.release();
          console.error('Error beginning transaction:', err);
          return callback(err);
        }

        // 1. Get todas las letras del protesto
        connection.query(
          'SELECT id_letra FROM protesto_letra WHERE id_protesto = ?',
          [id],
          (err, letras) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error getting letra IDs:', err);
                callback(err);
              });
            }

            // Si no hay letras, borrar solo el protesto y sus roles
            if (!letras || letras.length === 0) {
              connection.query('DELETE FROM protesto_roles WHERE id_protesto = ?', [id], err => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('Error deleting protesto roles:', err);
                    callback(err);
                  });
                }

                connection.query('DELETE FROM protesto WHERE id_protesto = ?', [id], err => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error('Error deleting protesto:', err);
                      callback(err);
                    });
                  }

                  connection.commit(err => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        console.error('Error committing transaction:', err);
                        callback(err);
                      });
                    }
                    connection.release();
                    callback(null, { success: true });
                  });
                });
              });
              return;
            }

            // Si hay  letras
            const letraIds = letras.map(l => l.id_letra);

            // 2. Eliminar roles endoso
            const deleteEndosoRolesQuery = `
              DELETE er FROM endoso_roles er
              WHERE er.id_endoso IN (
                SELECT e.id_endoso 
                FROM endoso e
                INNER JOIN letra_endoso le ON e.id_endoso = le.id_endoso
                WHERE le.id_letra IN (${letraIds.join(',')})
              )`;

            connection.query(deleteEndosoRolesQuery, err => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Error deleting endoso roles:', err);
                  callback(err);
                });
              }

              // 3. Eliminar relaciones letra_endoso 
              connection.query(`DELETE FROM letra_endoso WHERE id_letra IN (${letraIds.join(',')})`, err => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error('Error deleting letra_endoso relationships:', err);
                    callback(err);
                  });
                }

                // 4. Eliminar Endosos
                const deleteEndososQuery = `
                  DELETE e FROM endoso e
                  WHERE e.id_endoso IN (
                    SELECT le.id_endoso
                    FROM letra_endoso le
                    WHERE le.id_letra IN (${letraIds.join(',')})
                  )`;

                connection.query(deleteEndososQuery, err => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error('Error deleting endosos:', err);
                      callback(err);
                    });
                  }

                  // 5. Eliminar roles de la letra
                  connection.query(`DELETE FROM letra_roles WHERE id_letra IN (${letraIds.join(',')})`, err => {
                    if (err) {
                      return connection.rollback(() => {
                        connection.release();
                        console.error('Error deleting letra roles:', err);
                        callback(err);
                      });
                    }

                    // 6. Eliminar relaciones protesto_letra 
                    connection.query('DELETE FROM protesto_letra WHERE id_protesto = ?', [id], err => {
                      if (err) {
                        return connection.rollback(() => {
                          connection.release();
                          console.error('Error deleting protesto_letra relationships:', err);
                          callback(err);
                        });
                      }

                      // 7. Elinimar letras
                      connection.query(`DELETE FROM letracambio WHERE id_letra IN (${letraIds.join(',')})`, err => {
                        if (err) {
                          return connection.rollback(() => {
                            connection.release();
                            console.error('Error deleting letras:', err);
                            callback(err);
                          });
                        }

                        // 8. Eliminar roles del protesto
                        connection.query('DELETE FROM protesto_roles WHERE id_protesto = ?', [id], err => {
                          if (err) {
                            return connection.rollback(() => {
                              connection.release();
                              console.error('Error deleting protesto roles:', err);
                              callback(err);
                            });
                          }

                          // 9. Eliminar protesto protesto
                          connection.query('DELETE FROM protesto WHERE id_protesto = ?', [id], err => {
                            if (err) {
                              return connection.rollback(() => {
                                connection.release();
                                console.error('Error deleting protesto:', err);
                                callback(err);
                              });
                            }

                            connection.commit(err => {
                              if (err) {
                                return connection.rollback(() => {
                                  connection.release();
                                  console.error('Error committing transaction:', err);
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
                });
              });
            });
          }
        );
      });
    });
  }

  getById(id, callback) {
    const query = `
      SELECT p.*, m.nombre_moneda
      FROM protesto p
      LEFT JOIN moneda m ON p.id_moneda = m.id_moneda
      WHERE p.id_protesto = ?`;

    db.pool.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error in DAOProtesto.getById:', err);
        return callback(err);
      }
      callback(null, results[0]);
    });
  }

  create(protestoData, callback) {
      const sql = `INSERT INTO protesto (
          fecha_protesto, archivo, protocolo, pagina, id_ciudad, 
          id_tipo_letra, id_tipo_protesto, motivo, introduccion, fuente
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
          protestoData.fecha_protesto,
          protestoData.archivo,
          protestoData.protocolo,
          protestoData.pagina,
          protestoData.id_ciudad,
          protestoData.id_tipo_letra,
          protestoData.id_tipo_protesto,
          protestoData.motivo,
          protestoData.introduccion,
          protestoData.fuente
      ];
      
      db.pool.query(sql, values, (err, result) => {
          if (err) {
              console.error('Error in DAOProtesto.create:', err);
              return callback(err);
          }
          this.getById(result.insertId, callback);
      });
  }

  update(id, protestoData, callback) {
      const sql = `UPDATE protesto SET 
          fecha_protesto = ?, archivo = ?, protocolo = ?, pagina = ?, 
          id_ciudad = ?, id_tipo_letra = ?, id_tipo_protesto = ?, 
          motivo = ?, introduccion = ?, fuente = ?
          WHERE id_protesto = ?`;
      
      const values = [
          protestoData.fecha_protesto,
          protestoData.archivo,
          protestoData.protocolo,
          protestoData.pagina,
          protestoData.id_ciudad,
          protestoData.id_tipo_letra,
          protestoData.id_tipo_protesto,
          protestoData.motivo,
          protestoData.introduccion,
          protestoData.fuente,
          id
      ];
      
      db.pool.query(sql, values, (err, result) => {
          if (err) {
              console.error('Error in DAOProtesto.update:', err);
              return callback(err);
          }
          
          if (result.affectedRows === 0) {
              return callback(new Error('Protesto no encontrado'));
          }
          
          this.getById(id, callback);
      });
  }

  getTiposProtesto(callback) {
    const sql = 'SELECT id_tipo_protesto, nombre FROM tipo_protesto ORDER BY nombre';
    db.pool.query(sql, (err, results) => {
      if (err) {
        console.error('Error in getTiposProtesto:', err);
        return callback(err);
      }
      callback(null, results);
    });
  }

  getLastForAutofill(callback) {
    const sql = `
      SELECT 
        p.id_protesto,
        p.archivo,
        p.protocolo,
        p.id_ciudad AS ciudad_protesto_id,
        c.nombre_ciudad AS ciudad_nombre
      FROM protesto p
      LEFT JOIN ciudad c ON p.id_ciudad = c.id_ciudad
      ORDER BY p.id_protesto DESC
      LIMIT 1
    `;
    db.pool.query(sql, (err, results) => {
      if (err) {
        console.error('Error in DAOProtesto.getLastForAutofill:', err);
        return callback(err);
      }
      callback(null, results[0] || null);
    });
  }
}

module.exports = new DAOProtesto();