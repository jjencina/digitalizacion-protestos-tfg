const DAOFormulario = require('../integracion/DAOFormulario');
const SACiudad = require('./SACiudad');
const SAMoneda = require('./SAMoneda');
const SATipoLetra = require('./SATipoLetra');
const SATipoProtesto = require('./SATipoProtesto');

class SAFormulario {
  // Guardar formulario, normaliza (ciudad, moneda, tipos)
  saveForm(data, callback) {
    try {
      const entrada = this.normalizarDatosEntrada(data);

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[SAFormulario] Guardando formulario. Letras:', entrada.letras.length);
      }

      // Ejecutarlo en orden para evitar que los métodos asincronos intenten crear a la vez dos nombre unicos
      this.ejecutarEnSerie(
        entrada,
        [
          this.processCiudadIds.bind(this),
          this.processMonedaIds.bind(this),
          this.processTipoLetraIds.bind(this),
          this.processTipoProtestoIds.bind(this),
        ],
        (err, datosListos) => {
          if (err) return callback(err);
          DAOFormulario.save(datosListos, callback);
        }
      );
    } catch (error) {
      console.error('Error en SAFormulario.saveForm:', error);
      callback({ error: 'Error interno', details: error.message || 'Desconocido' });
    }
  }

  // -------------------- Normalización de campos --------------------

  // Ciudades en protesto, letras , endosos y roles adicionales
  processCiudadIds(data, callback) {
    const ciudadFields = [
      'ciudad_protesto_id',
      'escribano_ciudad_id',
      'protestante_ciudad_id',
      'presentado_ciudad_id',
      'representante_ciudad_id',
      'abona_ciudad_id',
      'cedido_ciudad_id',
    ];

    SACiudad.processCiudadFields(data, ciudadFields, (err, processedData) => {
      if (err) return callback(err);

      const continuarConLetras = () => this.processLetrasCiudades(processedData, callback);

      if (processedData.roles_adicionales?.length) {
        SACiudad.processRolesCiudades(
          processedData.roles_adicionales,
          'Protesto',
          (errRoles, rolesOk) => {
            if (errRoles) return callback(errRoles);
            processedData.roles_adicionales = rolesOk;
            continuarConLetras();
          }
        );
      } else {
        continuarConLetras();
      }
    });
  }

  processLetrasCiudades(data, callback) {
    const letras = Array.isArray(data.letras) ? data.letras : [];
    if (!letras.length) return callback(null, data);

    let pendientes = letras.length;

    letras.forEach((letra, letraIndex) => {
      const letraCiudadFields = [
        'ciudad_id',
        'librador_ciudad_id',
        'librado_ciudad_id',
        'aceptante_ciudad_id',
        'domiciliado_ciudad_id',
        'indicado_ciudad_id',
        'ordenante_ciudad_id',
        'beneficiario_ciudad_id'
      ];

      SACiudad.processCiudadFields(letra, letraCiudadFields, (err, lOk) => {
        if (err) return callback(err);

        const continuarConEndosos = () =>
          this.processEndososCiudades(lOk, letraIndex, data, () => {
            pendientes--;
            if (pendientes === 0) callback(null, data);
          });

        if (lOk.roles_adicionales?.length) {
          SACiudad.processRolesCiudades(lOk.roles_adicionales, `Letra[${letraIndex}]`, (e2, rolesOk) => {
            if (e2) return callback(e2);
            lOk.roles_adicionales = rolesOk;
            continuarConEndosos();
          });
        } else {
          continuarConEndosos();
        }
      });
    });
  }

  processEndososCiudades(letra, letraIndex, data, callback) {
    const endosos = Array.isArray(letra.endosos) ? letra.endosos : [];
    if (!endosos.length) return callback();

    let pendientes = endosos.length;

    endosos.forEach((endoso, endosoIndex) => {
      const endosoCiudadFields = ['ciudad_id', 'endosante_ciudad_id', 'endosado_ciudad_id'];

      SACiudad.processCiudadFields(endoso, endosoCiudadFields, (err, eOk) => {
        if (err) return callback(err);

        if (eOk.roles_adicionales?.length) {
          SACiudad.processRolesCiudades(
            eOk.roles_adicionales,
            `Letra[${letraIndex}] Endoso[${endosoIndex}]`,
            (e2, rolesOk) => {
              if (e2) return callback(e2);
              eOk.roles_adicionales = rolesOk;
              if (--pendientes === 0) callback();
            }
          );
        } else {
          if (--pendientes === 0) callback();
        }
      });
    });
  }

  // Monedas en protesto, letras y endosos
  processMonedaIds(data, callback) {
    const monedaFields = ['moneda_id'];
    SAMoneda.processMonedaFields(data, monedaFields, (err, dOk) => {
      if (err) return callback(err);
      this.processLetrasMonedas(dOk, callback);
    });
  }

  processLetrasMonedas(data, callback) {
    const letras = Array.isArray(data.letras) ? data.letras : [];
    if (!letras.length) return callback(null, data);

    let pendientes = letras.length;

    letras.forEach((letra) => {
      SAMoneda.processMonedaFields(letra, ['moneda_id'], (err, lOk) => {
        if (err) return callback(err);
        this.processEndososMonedas(lOk, () => {
          if (--pendientes === 0) callback(null, data);
        });
      });
    });
  }

  processEndososMonedas(letra, callback) {
    const endosos = Array.isArray(letra.endosos) ? letra.endosos : [];
    if (!endosos.length) return callback();

    let pendientes = endosos.length;

    endosos.forEach((endoso) => {
      SAMoneda.processMonedaFields(endoso, ['moneda_id'], (err) => {
        if (err) return callback(err);
        if (--pendientes === 0) callback();
      });
    });
  }

  // Tipos de letra (raíz y letras)
  processTipoLetraIds(data, callback) {
    const tipoLetraFields = ['tipo_letra_protesto_id'];
    SATipoLetra.processTipoLetraFields(data, tipoLetraFields, (err, dOk) => {
      if (err) return callback(err);
      this.processLetrasTipoLetra(dOk, callback);
    });
  }

  processLetrasTipoLetra(data, callback) {
    const letras = Array.isArray(data.letras) ? data.letras : [];
    if (!letras.length) return callback(null, data);

    let pendientes = letras.length;

    letras.forEach((letra) => {
      SATipoLetra.processTipoLetraFields(letra, ['tipo_letra_id'], (err) => {
        if (err) return callback(err);
        if (--pendientes === 0) callback(null, data);
      });
    });
  }

  // Tipos de protesto
  processTipoProtestoIds(data, callback) {
    const tipoProtestoFields = ['tipo_protesto_id'];
    SATipoProtesto.processTipoProtestoFields(data, tipoProtestoFields, (err, dOk) => {
      if (err) return callback(err);
      callback(null, dOk);
    });
  }

  normalizarDatosEntrada(data) {
    const d = data || {};
    d.letras = Array.isArray(d.letras) ? d.letras : [];
    d.roles_adicionales = Array.isArray(d.roles_adicionales) ? d.roles_adicionales : [];
    d.letras.forEach((letra) => {
      letra.endosos = Array.isArray(letra.endosos) ? letra.endosos : [];
      letra.roles_adicionales = Array.isArray(letra.roles_adicionales) ? letra.roles_adicionales : [];
    });
    return d;
  }

  ejecutarEnSerie(data, pasos, cb) {
    let i = 0;
    const siguiente = (actual) => {
      if (i >= pasos.length) return cb(null, actual);
      const fn = pasos[i++];
      fn(actual, (err, nuevo) => {
        if (err) return cb(err);
        siguiente(nuevo || actual);
      });
    };
    siguiente(data);
  }
}

module.exports = new SAFormulario();