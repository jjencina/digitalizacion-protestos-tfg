const db = require('../config/db');

// Mock del pool/connection con lo justo
jest.mock('../config/db', () => {
  const conn = {
    beginTransaction: jest.fn(cb => cb(null)),
    commit: jest.fn(cb => cb(null)),
    rollback: jest.fn(cb => cb(null)),
    release: jest.fn(),
    query: jest.fn()
  };
  return {
    pool: {
      getConnection: jest.fn(cb => cb(null, conn))
    },
    __conn: conn // acceso fácil al mock
  };
});

const DAOFormulario = require('../integracion/DAOFormulario');

const okInsert = (() => {
  let id = 1;
  return (sql, params, cb) => {
    // Para cualquier SELECT devolvemos algo neutro
    if (/^\s*select/i.test(sql)) return cb(null, []);
    // Para INSERT devolvemos insertId incremental
    if (/^\s*insert/i.test(sql)) return cb(null, { insertId: id++ });
    // Para UPDATE/DELETE, OK sin datos
    return cb(null, { affectedRows: 1 });
  };
})();

describe('Persistencia formulario (DAOFormulario)', () => {
  let conn;
  beforeEach(() => {
    jest.clearAllMocks();
    conn = db.__conn;
    conn.query.mockImplementation(okInsert);
  });

  test('Guarda protesto completo con letras, endosos, comentarios y roles', done => {
    // Datos mínimos pero con todo lo importante
    const data = {
      fecha_protesto: '2025-03-21',
      archivo: 'A1',
      protocolo: 'P1',
      pagina: '10',
      ciudad_protesto_id: 1,
      tipo_letra_protesto_id: 2,
      tipo_protesto_id: 3,
      motivo_impago: 'Motivo',
      detalles_abono: 'Abono',
      comentario: 'Comentario protesto',
      escribano_id: 1,
      protestante_persona_id: 2,
      presentado_persona_id: 3,
      roles_adicionales: [{ id_persona: 99, id_ciudad: 88, id_rol: 10 }],
      letras: [{
        fecha_emision: '2025-03-01',
        fecha_vencimiento: '2025-04-01',
        importe: 1000,
        moneda_id: 1,
        tipo_letra_id: 1,
        ciudad_id: 1,
        detalles_indicacion: 'Detalle ind.',
        comentario: 'Comentario letra',
        librador_persona_id: 4,
        librado_persona_id: 5,
        aceptante_persona_id: 6,
        indicado_persona_id: 7,
        roles_adicionales: [{ id_persona: 77, id_ciudad: 66, id_rol: 15 }],
        endosos: [{
          fecha: '2025-03-15',
          importe: 500,
          moneda_id: 2,
          ciudad_id: 3,
          comentario: 'Comentario endoso',
          endosante_persona_id: 8,
          endosado_persona_id: 9,
          roles_adicionales: [{ id_persona: 55, id_ciudad: 44, id_rol: 6 }]
        }]
      }]
    };

    DAOFormulario.save(data, (err, res) => {
      expect(err).toBeNull();
      expect(res).toHaveProperty('protestoId');

      // Se obtuvo conexión y transacción OK
      expect(db.pool.getConnection).toHaveBeenCalled();
      expect(conn.beginTransaction).toHaveBeenCalled();
      expect(conn.commit).toHaveBeenCalled();
      expect(conn.rollback).not.toHaveBeenCalled();
      expect(conn.release).toHaveBeenCalled();

      // Insert principal del protesto (con comentario)
      expect(conn.query).toHaveBeenCalledWith(
        expect.stringMatching(/insert\s+into\s+protesto/i),
        expect.arrayContaining([
          data.fecha_protesto,
          data.archivo,
          data.protocolo,
          data.pagina,
          data.ciudad_protesto_id,
          data.tipo_letra_protesto_id,
          data.tipo_protesto_id,
          data.motivo_impago,
          data.detalles_abono,
          data.comentario
        ]),
        expect.any(Function)
      );

      // Roles del protesto (estándar y adicionales)
      expect(conn.query).toHaveBeenCalledWith(
        expect.stringMatching(/insert\s+into\s+protesto_roles/i),
        expect.any(Array),
        expect.any(Function)
      );

      // Inserción de letra (con comentario y detalles_indicacion)
      expect(conn.query).toHaveBeenCalledWith(
        expect.stringMatching(/insert\s+into\s+letracambio/i),
        expect.arrayContaining([
          data.letras[0].fecha_emision,
          data.letras[0].fecha_vencimiento,
          data.letras[0].importe,
          data.letras[0].moneda_id,
          data.letras[0].tipo_letra_id,
          data.letras[0].ciudad_id,
          data.letras[0].detalles_indicacion,
          data.letras[0].comentario
        ]),
        expect.any(Function)
      );

      // Roles de letra (estándar y adicionales)
      expect(conn.query).toHaveBeenCalledWith(
        expect.stringMatching(/insert\s+into\s+letra_roles/i),
        expect.any(Array),
        expect.any(Function)
      );

      // Inserción de endoso (con comentario)
      expect(conn.query).toHaveBeenCalledWith(
        expect.stringMatching(/insert\s+into\s+endoso/i),
        expect.arrayContaining([
          data.letras[0].endosos[0].fecha,
          data.letras[0].endosos[0].importe,
          data.letras[0].endosos[0].moneda_id,
          data.letras[0].endosos[0].ciudad_id,
          data.letras[0].endosos[0].comentario
        ]),
        expect.any(Function)
      );

      // Roles del endoso (estándar y adicionales)
      expect(conn.query).toHaveBeenCalledWith(
        expect.stringMatching(/insert\s+into\s+endoso_roles/i),
        expect.any(Array),
        expect.any(Function)
      );

      done();
    });
  });

  // test('Maneja error de base de datos (rollback)', done => {
  //   // Forzar fallo en la primera query
  //   conn.query.mockImplementationOnce((sql, p, cb) => cb(new Error('DB fail')));
  //   DAOFormulario.save({ fecha_protesto: '2025-01-01' }, (err, res) => {
  //     expect(err).toBeTruthy();
  //     expect(conn.rollback).toHaveBeenCalled();
  //     expect(conn.release).toHaveBeenCalled();
  //     done();
  //   });
  // });
});