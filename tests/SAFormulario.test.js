const SAFormulario = require('../negocio/SAFormulario');
const DAOFormulario = require('../integracion/DAOFormulario');
const SAPersona = require('../negocio/SAPersona');
const SACiudad = require('../negocio/SACiudad');
const SAMoneda = require('../negocio/SAMoneda');
const SATipoLetra = require('../negocio/SATipoLetra');
const SATipoProtesto = require('../negocio/SATipoProtesto');

// Mocks de dependencias
jest.mock('../integracion/DAOFormulario');
jest.mock('../negocio/SAPersona');
jest.mock('../negocio/SACiudad');
jest.mock('../negocio/SAMoneda');
jest.mock('../negocio/SATipoLetra');
jest.mock('../negocio/SATipoProtesto');

// Helper para ejecutar y devolver {err,res}
const run = data => new Promise(r => SAFormulario.saveForm(data, (err, res) => r({ err, res })));

describe('SAFormulario (versión corta)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'table').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Por defecto, todo OK y en paso directo
    SACiudad.processCiudadFields.mockImplementation((data, fields, cb) => cb(null, data));
    SACiudad.processRolesCiudades.mockImplementation((roles, ctx, cb) => cb(null, roles));
    SAMoneda.processMonedaFields.mockImplementation((data, fields, cb) => cb(null, data));
    SATipoLetra.processTipoLetraFields.mockImplementation((data, fields, cb) => cb(null, data));
    SATipoProtesto.processTipoProtestoFields.mockImplementation((data, fields, cb) => cb(null, data));
    DAOFormulario.save.mockImplementation((data, cb) => cb(null, { success: true, protestoId: 1 }));
  });

  afterEach(() => jest.restoreAllMocks());

  test('Guarda con entidades existentes, comentarios y roles', async () => {
    const formData = {
      archivo: 'A1', protocolo: 'P1', pagina: '1', fecha_protesto: '2025-03-21',
      escribano_id: '1', ciudad_protesto_id: '1', tipo_letra_protesto_id: '1', tipo_protesto_id: '1',
      motivo_impago: 'Motivo', detalles_abono: 'Abono', comentario: 'Comentario protesto',
      roles_adicionales: [{ id_rol: '5', id_persona: '10', id_ciudad: '20' }],
      letras: [{
        importe: '1000', moneda_id: '1', fecha_emision: '2025-03-01', fecha_vencimiento: '2025-04-01',
        tipo_letra_id: '1', ciudad_id: '1', comentario: 'Comentario letra',
        roles_adicionales: [{ id_rol: '6', id_persona: '11', id_ciudad: '21' }],
        endosos: [{
          fecha: '2025-03-15', importe: '500', moneda_id: '1', ciudad_id: '1', comentario: 'Comentario endoso',
          endosante_persona_id: '1', endosado_persona_id: '1',
          roles_adicionales: [{ id_rol: '7', id_persona: '12', id_ciudad: '22' }]
        }]
      }]
    };

    const { err, res } = await run(formData);
    expect(err).toBeNull();
    expect(res).toEqual({ success: true, protestoId: 1 });
    expect(DAOFormulario.save).toHaveBeenCalledTimes(1);
  });

  test('Convierte cadenas a IDs vía servicios (mínimo)', async () => {
    // Simular mapeo a IDs numéricos
    const toId = v => (isNaN(v) ? 900 : Number(v));
    SACiudad.processCiudadFields.mockImplementation((data, fields, cb) => {
      const d = { ...data }; (fields || []).forEach(f => d[f] = d[f] == null ? d[f] : toId(d[f])); cb(null, d);
    });
    SACiudad.processRolesCiudades.mockImplementation((roles, ctx, cb) => cb(null, roles.map(r => ({ ...r, id_ciudad: toId(r.id_ciudad) }))));
    SAMoneda.processMonedaFields.mockImplementation((data, fields, cb) => {
      const d = { ...data }; (fields || []).forEach(f => d[f] = d[f] == null ? d[f] : toId(d[f])); cb(null, d);
    });
    SATipoLetra.processTipoLetraFields.mockImplementation((data, fields, cb) => {
      const d = { ...data }; (fields || []).forEach(f => d[f] = d[f] == null ? d[f] : toId(d[f])); cb(null, d);
    });
    SATipoProtesto.processTipoProtestoFields.mockImplementation((data, fields, cb) => {
      const d = { ...data }; (fields || []).forEach(f => d[f] = d[f] == null ? d[f] : toId(d[f])); cb(null, d);
    });

    const formData = {
      ciudad_protesto_id: 'Nueva Ciudad',
      tipo_letra_protesto_id: 'Nuevo Tipo',
      tipo_protesto_id: 'Nuevo Pro',
      letras: [{ moneda_id: 'Nueva Moneda', tipo_letra_id: 'Tipo Letra', endosos: [{ moneda_id: 'Moneda X' }] }]
    };

    await run(formData);
    const saved = DAOFormulario.save.mock.calls[0][0];
    expect(typeof saved.ciudad_protesto_id).toBe('number');
    expect(typeof saved.tipo_letra_protesto_id).toBe('number');
    expect(typeof saved.tipo_protesto_id).toBe('number');
    // expect(typeof saved.letras[0].moneda_id).toBe('number');
    // expect(typeof saved.letras[0].tipo_letra_id).toBe('number');
    // expect(typeof saved.letras[0].endosos[0].moneda_id).toBe('number');
  });

  test.each([
    ['ciudades', () => SACiudad.processCiudadFields.mockImplementation((d, f, cb) => cb(new Error('Error processing ciudades')))],
    ['monedas', () => SAMoneda.processMonedaFields.mockImplementation((d, f, cb) => cb(new Error('Error processing monedas')))],
    ['tipo letra', () => SATipoLetra.processTipoLetraFields.mockImplementation((d, f, cb) => cb(new Error('Error processing tipos letra')))],
    ['tipo protesto', () => SATipoProtesto.processTipoProtestoFields.mockImplementation((d, f, cb) => cb(new Error('Error processing tipos protesto')))]
  ])('Propaga error de %s', async (_, setup) => {
    setup();
    const { err, res } = await run({ letras: [{ moneda_id: '1' }] });
    expect(res).toBeUndefined();
    expect(err).toBeTruthy();
  });

  // test('Error inesperado controlado', async () => {
  //   SACiudad.processCiudadFields.mockImplementation(() => { throw new Error('boom'); });
  //   const { err } = await run({ escribano_id: '1' });
  //   expect(err).toEqual({ error: 'Internal server error', details: 'boom' });
  // });

  test('Soporta datos vacíos', async () => {
    const { err, res } = await run({});
    expect(err).toBeNull();
    expect(res.success).toBe(true);
  });

  test('Sin letras', async () => {
    const { err, res } = await run({ escribano_id: '1' });
    expect(err).toBeNull();
    expect(res.success).toBe(true);
  });

  test('Letra sin endosos', async () => {
    const { err, res } = await run({ letras: [{ importe: '1000', moneda_id: '1', tipo_letra_id: '1' }] });
    expect(err).toBeNull();
    expect(res.success).toBe(true);
  });

  test('Múltiples letras, endosos y roles', async () => {
    const formData = {
      roles_adicionales: [
        { id_rol: '5', id_persona: '10', id_ciudad: '20' },
        { id_rol: '6', id_persona: '11', id_ciudad: '21' }
      ],
      letras: [
        {
          importe: '1000', moneda_id: '1',
          roles_adicionales: [{ id_rol: '7', id_persona: '12', id_ciudad: '22' }],
          endosos: [
            { importe: '500', moneda_id: '1', roles_adicionales: [{ id_rol: '8', id_persona: '13', id_ciudad: '23' }] },
            { importe: '300', moneda_id: '1', roles_adicionales: [{ id_rol: '9', id_persona: '14', id_ciudad: '24' }] }
          ]
        },
        {
          importe: '2000', moneda_id: '2',
          roles_adicionales: [{ id_rol: '10', id_persona: '15', id_ciudad: '25' }],
          endosos: [{ importe: '1000', moneda_id: '2', roles_adicionales: [{ id_rol: '11', id_persona: '16', id_ciudad: '26' }] }]
        }
      ]
    };

    const { err, res } = await run(formData);
    expect(err).toBeNull();
    expect(res.success).toBe(true);
  });
});