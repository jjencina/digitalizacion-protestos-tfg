const db = require('../config/db');

const ROLES = {
  PROTESTANTE: 1,
  PRESENTADOR: 2,
  GESTOR: 3,
  LIBRADO: 4,
  LIBRADOR: 5,
  TENEDOR: 6,
  ENDOSADO: 7,
  ENDOSANTE: 8,
  INDICADO: 9,
  TESTIGO: 10,
  ACEPTANTE: 11,
  DOMICILIARIO: 12,
  ABONANTE: 13,
  CESIONARIO: 14,
  FIADOR: 15,
  ESCRIBANO: 16,
  REPRESENTANTE: 17,
  ORDENANTE: 25,
  BENEFICIARIO: 26
};

class DAOFormulario {
  save(data, callback) {
    db.pool.getConnection((err, connection) => {
      if (err) return callback(err);

      connection.beginTransaction(err => {
        if (err) {
          connection.release();
          return callback(err);
        }

        // 1 Normalizar y resolver personas (si hay nombres (se crean nuevas personas) en vez de id (si se usan personas que ya estan en la bd))
        this.processAllPersonas(data, connection, (err, datosConPersonas) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err);
            });
          }

          this.insertProtestoCompleto(connection, datosConPersonas, (err, protestoId) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err);
              });
            }

            connection.commit(commitErr => {
              if (commitErr) {
                return connection.rollback(() => {
                  connection.release();
                  callback(commitErr);
                });
              }
              connection.release();
              callback(null, { protestoId });
            });
          });
        });
      });
    });
  }

  // -------- PERSONAS -----------

  processAllPersonas(data, connection, callback) {
    const processedData = JSON.parse(JSON.stringify(data));
    const cache = new Map();
    const toResolve = new Set();

    // Campos de persona en el protesto
    const protestoPersonaFields = [
      'escribano_id',
      'protestante_persona_id',
      'presentado_persona_id',
      'representante_persona_id',
      'abona_persona_id',
      'cedido_persona_id'
    ];

    // 1 Recoger nombres no numéricos del protesto
    protestoPersonaFields.forEach(fn => {
      const v = processedData[fn];
      if (v && isNaN(v)) toResolve.add(this.normalizeName(v));
    });

    // 2 Recoger nombres de roles adicionales del protesto
    if (Array.isArray(processedData.roles_adicionales)) {
      processedData.roles_adicionales.forEach(rol => {
        if (rol && rol.id_persona && isNaN(rol.id_persona)) {
          toResolve.add(this.normalizeName(rol.id_persona));
        }
      });
    }

    // 3 Letras
    if (Array.isArray(processedData.letras)) {
      processedData.letras.forEach(letra => {
        const letraPersonaFields = [
          'librador_persona_id',
          'librado_persona_id',
          'aceptante_persona_id',
          'domiciliado_persona_id',
          'indicado_persona_id',
          'ordenante_persona_id',
          'beneficiario_persona_id'
        ];
        letraPersonaFields.forEach(fn => {
          const v = letra[fn];
          if (v && isNaN(v)) toResolve.add(this.normalizeName(v));
        });

        if (Array.isArray(letra.roles_adicionales)) {
          letra.roles_adicionales.forEach(rol => {
            if (rol && rol.id_persona && isNaN(rol.id_persona)) {
              toResolve.add(this.normalizeName(rol.id_persona));
            }
          });
        }

        // Endosos
        if (Array.isArray(letra.endosos)) {
          letra.endosos.forEach(endoso => {
            ['endosante_persona_id', 'endosado_persona_id', 'poderhabiente_endosante_persona_id'].forEach(fn => {
              const v = endoso[fn];
              if (v && isNaN(v)) toResolve.add(this.normalizeName(v));
            });
            if (Array.isArray(endoso.roles_adicionales)) {
              endoso.roles_adicionales.forEach(rol => {
                if (rol && rol.id_persona && isNaN(rol.id_persona)) {
                  toResolve.add(this.normalizeName(rol.id_persona));
                }
              });
            }
          });
        }
      });
    }

    const names = Array.from(toResolve);
    if (names.length === 0) {
      return callback(null, processedData);
    }

    let pending = names.length;
    let failed = false;

    names.forEach(nm => {
      const pretty = this.denormalizeName(nm);
      this.findOrCreatePersona(connection, pretty, nm, (err, id) => {
        if (failed) return;
        if (err) {
          failed = true;
          return callback(err);
        }
        cache.set(nm, id);
        pending--;
        if (pending === 0) {
          // Sustituir cadenas por IDs usando el cache
          this.applyPersonaCache(processedData, cache);
          callback(null, processedData);
        }
      });
    });
  }

  applyPersonaCache(data, cache) {
    const replaceIfNeeded = (obj, field) => {
      const v = obj[field];
      if (v && isNaN(v)) {
        const id = cache.get(this.normalizeName(v));
        if (id) obj[field] = id;
      }
    };

    const protestoPersonaFields = [
      'escribano_id',
      'protestante_persona_id',
      'presentado_persona_id',
      'representante_persona_id',
      'abona_persona_id',
      'cedido_persona_id'
    ];
    protestoPersonaFields.forEach(f => replaceIfNeeded(data, f));

    if (Array.isArray(data.roles_adicionales)) {
      data.roles_adicionales.forEach(rol => replaceIfNeeded(rol, 'id_persona'));
    }

    if (Array.isArray(data.letras)) {
      data.letras.forEach(letra => {
        ['librador_persona_id', 'librado_persona_id', 'aceptante_persona_id', 'domiciliado_persona_id', 'indicado_persona_id', 'ordenante_persona_id', 'beneficiario_persona_id']
          .forEach(f => replaceIfNeeded(letra, f));

        if (Array.isArray(letra.roles_adicionales)) {
          letra.roles_adicionales.forEach(rol => replaceIfNeeded(rol, 'id_persona'));
        }

        if (Array.isArray(letra.endosos)) {
          letra.endosos.forEach(e => {
            ['endosante_persona_id', 'endosado_persona_id', 'poderhabiente_endosante_persona_id'].forEach(f => replaceIfNeeded(e, f));
            if (Array.isArray(e.roles_adicionales)) {
              e.roles_adicionales.forEach(rol => replaceIfNeeded(rol, 'id_persona'));
            }
          });
        }
      });
    }
  }

  findOrCreatePersona(connection, originalName, normalizedName, cb) {
    const searchTerm = normalizedName.toLowerCase();
    const sql = `
      SELECT id_persona, nombre, apellidos,
             LOWER(TRIM(CONCAT(nombre, ' ', COALESCE(apellidos, '')))) AS nombre_completo
      FROM persona
      WHERE LOWER(TRIM(CONCAT(nombre, ' ', COALESCE(apellidos, '')))) = ?
         OR LOWER(TRIM(CONCAT(nombre, ' ', COALESCE(apellidos, '')))) LIKE ?
      ORDER BY (LOWER(TRIM(CONCAT(nombre, ' ', COALESCE(apellidos, '')))) = ?) DESC, id_persona ASC
      LIMIT 1
    `;
    connection.query(sql, [searchTerm, searchTerm, searchTerm], (err, rows) => {
      if (err) return cb(err);
      if (rows.length) return cb(null, rows[0].id_persona);

      // Crear nueva
      const [nombre, ...apellidosParts] = originalName.trim().split(/\s+/);
      const apellidos = apellidosParts.join(' ') || null;
      connection.query(
        'INSERT INTO persona (nombre, apellidos) VALUES (?, ?)',
        [nombre || originalName.trim(), apellidos],
        (insErr, res) => {
          if (insErr) return cb(insErr);
          cb(null, res.insertId);
        }
      );
    });
  }

  normalizeName(str) {
    if (!str) return '';
    return String(str)
      .trim()
      .toLowerCase()
      .trim();
  }

  //Nombres formato lectura con mayusculas en las iniciales
  denormalizeName(norm) {
    return norm.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // -------------- INSERT ---------------

  insertProtestoCompleto(connection, data, cb) {
    // 1 Protesto
    const protestoSql = `
      INSERT INTO protesto
      (fecha_protesto, archivo, protocolo, pagina,
       id_ciudad, id_tipo_letra, id_tipo_protesto,
       motivo, texto_abono, comentarios)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const protestoVals = [
      data.fecha_protesto || null,
      data.archivo || null,
      data.protocolo || null,
      data.pagina || null,
      this._nullIfEmpty(data.ciudad_protesto_id),
      this._nullIfEmpty(data.tipo_letra_protesto_id),
      this._nullIfEmpty(data.tipo_protesto_id),
      data.motivo_impago || null,
      data.detalles_abono || null,
      data.comentario || null
    ];

    connection.query(protestoSql, protestoVals, (err, res) => {
      if (err) return cb(err);
      const protestoId = res.insertId;

      const protestoRoles = this.buildProtestoRoles(data);
      this._insertRolesBulk(
        connection,
        'protesto_roles',
        ['id_protesto', 'id_ciudad', 'id_persona', 'id_rol'],
        protestoRoles.map(r => [
          protestoId,
          this._nullIfEmpty(r.id_ciudad),
          this._nullIfEmpty(r.id_persona),
          r.id_rol
        ]),
        (err) => {
          if (err) return cb(err);

          this._insertLetrasEndosos(connection, protestoId, data.letras || [], (err) => {
            if (err) return cb(err);
            cb(null, protestoId);
          });
        }
      );
    });
  }

  buildProtestoRoles(data) {
    const roles = [];
    const protestoCityId = this._nullIfEmpty(data.ciudad_protesto_id);

    if (data.escribano_id) {
      roles.push({ id_persona: data.escribano_id, id_ciudad: protestoCityId, id_rol: ROLES.ESCRIBANO });
    }
    if (data.protestante_persona_id) {
      roles.push({ id_persona: data.protestante_persona_id, id_ciudad: protestoCityId, id_rol: ROLES.PROTESTANTE });
    }
    if (data.presentado_persona_id) {
      roles.push({ id_persona: data.presentado_persona_id, id_ciudad: this._nullIfEmpty(data.presentado_ciudad_id), id_rol: ROLES.PRESENTADOR });
    }
    if (data.representante_persona_id) {
      roles.push({ id_persona: data.representante_persona_id, id_ciudad: this._nullIfEmpty(data.representante_ciudad_id), id_rol: ROLES.REPRESENTANTE });
    }
    if (data.abona_persona_id) {
      roles.push({ id_persona: data.abona_persona_id, id_ciudad: this._nullIfEmpty(data.abona_ciudad_id), id_rol: ROLES.ABONANTE });
    }
    if (data.cedido_persona_id) {
      roles.push({ id_persona: data.cedido_persona_id, id_ciudad: this._nullIfEmpty(data.cedido_ciudad_id), id_rol: ROLES.CESIONARIO });
    }

    if (Array.isArray(data.roles_adicionales)) {
      data.roles_adicionales.forEach(rol => {
        if (rol && rol.id_rol) {
          roles.push({
            id_persona: this._nullIfEmpty(rol.id_persona),
            id_ciudad: this._nullIfEmpty(rol.id_ciudad),
            id_rol: parseInt(rol.id_rol, 10)
          });
        }
      });
    }
    return roles;
  }

  _insertLetrasEndosos(connection, protestoId, letras, cb) {
    if (!letras.length) return cb(null);

    let i = 0;
    const next = () => {
      if (i >= letras.length) return cb(null);
      const letra = letras[i++];

      // Insertar letra
      const sql = `
        INSERT INTO letracambio
        (fecha_letra, fecha_vencimiento, importe, id_moneda, id_tipo_letra, id_ciudad, texto_indicacion, comentarios)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const vals = [
        this._nullIfEmpty(letra.fecha_emision),
        this._nullIfEmpty(letra.fecha_vencimiento),
        this._nullIfEmpty(letra.importe),
        this._nullIfEmpty(letra.moneda_id),
        this._nullIfEmpty(letra.tipo_letra_id),
        this._nullIfEmpty(letra.ciudad_id),
        this._nullIfEmpty(letra.detalles_indicacion),
        this._nullIfEmpty(letra.comentario)
      ];

      connection.query(sql, vals, (err, res) => {
        if (err) return cb(err);
        const letraId = res.insertId;

        // Relación protesto_letra
        connection.query(
          'INSERT INTO protesto_letra (id_letra, id_protesto) VALUES (?, ?)',
          [letraId, protestoId],
          (err) => {
            if (err) return cb(err);

            // Roles de la letra + adicionales
            const letraRoles = this._buildLetraRoles(letra);
            this._insertRolesBulk(
              connection,
              'letra_roles',
              ['id_letra', 'id_ciudad', 'id_persona', 'id_rol'],
              (letraRoles || []).map(r => [
                letraId,
                this._nullIfEmpty(r.id_ciudad),
                this._nullIfEmpty(r.id_persona),
                r.id_rol
              ]),
              (err) => {
                if (err) return cb(err);

                // Endosos de la letra
                this._insertEndosos(connection, letraId, letra.endosos || [], (err) => {
                  if (err) return cb(err);
                  next();
                });
              }
            );
          }
        );
      });
    };
    next();
  }

  _buildLetraRoles(letra) {
    const roles = [];
    if (letra.librador_persona_id) {
      roles.push({ id_persona: letra.librador_persona_id, id_ciudad: this._nullIfEmpty(letra.librador_ciudad_id), id_rol: ROLES.LIBRADOR });
    }
    if (letra.librado_persona_id) {
      roles.push({ id_persona: letra.librado_persona_id, id_ciudad: this._nullIfEmpty(letra.librado_ciudad_id), id_rol: ROLES.LIBRADO });
    }
    if (letra.aceptante_persona_id) {
      roles.push({ id_persona: letra.aceptante_persona_id, id_ciudad: this._nullIfEmpty(letra.aceptante_ciudad_id), id_rol: ROLES.ACEPTANTE });
    }
    if (letra.domiciliado_persona_id) {
      roles.push({ id_persona: letra.domiciliado_persona_id, id_ciudad: this._nullIfEmpty(letra.domiciliado_ciudad_id), id_rol: ROLES.DOMICILIARIO });
    }
    if (letra.indicado_persona_id) {
      roles.push({ id_persona: letra.indicado_persona_id, id_ciudad: this._nullIfEmpty(letra.indicado_ciudad_id), id_rol: ROLES.INDICADO });
    }
    if (letra.ordenante_persona_id) {
      roles.push({ id_persona: letra.ordenante_persona_id, id_ciudad: this._nullIfEmpty(letra.ordenante_ciudad_id), id_rol: ROLES.ORDENANTE });
    }
    if (letra.beneficiario_persona_id) {
      roles.push({ id_persona: letra.beneficiario_persona_id, id_ciudad: this._nullIfEmpty(letra.beneficiario_ciudad_id), id_rol: ROLES.BENEFICIARIO });
    }

    if (Array.isArray(letra.roles_adicionales)) {
      letra.roles_adicionales.forEach(rol => {
        if (rol && rol.id_rol) {
          roles.push({
            id_persona: this._nullIfEmpty(rol.id_persona),
            id_ciudad: this._nullIfEmpty(rol.id_ciudad),
            id_rol: parseInt(rol.id_rol, 10)
          });
        }
      });
    }
    return roles;
  }

  _insertEndosos(connection, letraId, endosos, cb) {
    if (!endosos.length) return cb(null);

    let j = 0;
    const loop = () => {
      if (j >= endosos.length) return cb(null);
      const e = endosos[j++];

      const sql = `
        INSERT INTO endoso (fecha_endoso, valor, id_moneda, id_ciudad)
        VALUES (?, ?, ?, ?)
      `;
      const vals = [
        this._nullIfEmpty(e.fecha_endoso || e.fecha || null),
        this._nullIfEmpty(e.valor),
        this._nullIfEmpty(e.moneda_id),
        this._nullIfEmpty(e.ciudad_id)
      ];

      connection.query(sql, vals, (err, res) => {
        if (err) return cb(err);
        const endosoId = res.insertId;

        // Relación letra_endoso
        connection.query(
          'INSERT INTO letra_endoso (id_letra, id_endoso) VALUES (?, ?)',
          [letraId, endosoId],
          (err) => {
            if (err) return cb(err);

            // Roles por defecto del endoso + adicionales
            const endosoRoles = this._buildEndosoRoles(e);
            this._insertRolesBulk(
              connection,
              'endoso_roles',
              ['id_endoso', 'id_ciudad', 'id_persona', 'id_rol'],
              (endosoRoles || []).map(r => [
                endosoId,
                this._nullIfEmpty(r.id_ciudad),
                this._nullIfEmpty(r.id_persona),
                r.id_rol
              ]),
              (err) => {
                if (err) return cb(err);
                loop();
              }
            );
          }
        );
      });
    };
    loop();
  }

  _buildEndosoRoles(endoso) {
    const roles = [];
    if (endoso.endosante_persona_id) {
      roles.push({ id_persona: endoso.endosante_persona_id, id_ciudad: this._nullIfEmpty(endoso.endosante_ciudad_id), id_rol: ROLES.ENDOSANTE });
    }
    if (endoso.endosado_persona_id) {
      roles.push({ id_persona: endoso.endosado_persona_id, id_ciudad: this._nullIfEmpty(endoso.endosado_ciudad_id), id_rol: ROLES.ENDOSADO });
    }
    if (Array.isArray(endoso.roles_adicionales)) {
      endoso.roles_adicionales.forEach(rol => {
        if (rol && rol.id_rol) {
          roles.push({
            id_persona: this._nullIfEmpty(rol.id_persona),
            id_ciudad: this._nullIfEmpty(rol.id_ciudad),
            id_rol: parseInt(rol.id_rol, 10)
          });
        }
      });
    }
    return roles;
  }

  _insertRolesBulk(connection, table, columns, values, cb) {
    if (!values || !values.length) return cb(null);
    const cols = columns.join(', ');
    const sql = `INSERT IGNORE INTO ${table} (${cols}) VALUES ?`;
    connection.query(sql, [values], cb);
  }

  _nullIfEmpty(v) {
    return v === '' || v === undefined ? null : v;
  }

  // Para Autorellenado del formulario
  getLastProtesto(callback) {
    const sql = `
      SELECT 
        p.archivo,
        p.protocolo,
        p.id_ciudad AS ciudad_protesto_id,
        c.nombre_ciudad AS ciudad_nombre,
        pr.id_persona AS escribano_id,
        CONCAT(per.nombre, ' ', COALESCE(per.apellidos, '')) AS escribano_nombre
      FROM protesto p
      LEFT JOIN ciudad c ON p.id_ciudad = c.id_ciudad
      LEFT JOIN protesto_roles pr 
        ON pr.id_protesto = p.id_protesto AND pr.id_rol = ?
      LEFT JOIN persona per ON per.id_persona = pr.id_persona
      ORDER BY p.id_protesto DESC
      LIMIT 1
    `;
    db.pool.query(sql, [ROLES.ESCRIBANO], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows[0] || {});
    });
  }
}

module.exports = new DAOFormulario();