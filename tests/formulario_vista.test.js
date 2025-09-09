const { JSDOM } = require('jsdom');

const domTemplate = `
<!DOCTYPE html>
<html>
<body>
  <form id="protestoForm">
    <!-- Campos básicos del protesto -->
    <input name="archivo" value="Archivo1">
    <input name="protocolo" value="Protocolo1">
    <input name="pagina" value="1">
    <input name="fecha_protesto" value="2025-03-21">
    <input name="escribano_id" value="1">
    <input name="ciudad_protesto_id" value="1">
    <input name="protestante_persona_id" value="1">
    <input name="protestante_ciudad_id" value="1">
    <input name="tipo_letra_protesto_id" value="1">
    <input name="tipo_protesto_id" value="1">
    <textarea name="motivo_impago">Motivo de prueba</textarea>
    <input name="representante_persona_id" value="1">
    <input name="presentado_persona_id" value="1">
    <input name="presentado_ciudad_id" value="1">
    <textarea name="detalles_abono">Detalles de prueba</textarea>
    <input name="abona_persona_id" value="1">
    <input name="abona_ciudad_id" value="1">
    <input name="cedido_persona_id" value="1">
    <input name="cedido_ciudad_id" value="1">

    <!-- Roles adicionales (protesto) -->
    <div id="protestoRolesContainer">
      <div class="rol-adicional-container">
        <input type="hidden" name="roles_protesto[][id_rol]" value="5">
        <input type="text" class="persona-search" value="Juan Pérez">
        <input type="hidden" name="roles_protesto[][persona_id]" value="10">
        <input type="text" class="ciudad-search" value="Madrid">
        <input type="hidden" name="roles_protesto[][ciudad_id]" value="20">
      </div>
    </div>

    <!-- Comentario protesto -->
    <textarea id="comentario_protesto" name="comentario_protesto">Comentario del protesto</textarea>

    <!-- Una letra con un endoso -->
    <div id="letrasContainer">
      <div class="letra-section" id="letra_0">
        <input name="letras[0][importe]" value="1000">
        <input name="letras[0][moneda_id]" value="1">
        <input name="letras[0][fecha_emision]" value="2025-03-01">
        <input name="letras[0][fecha_vencimiento]" value="2025-04-01">
        <input name="letras[0][tipo_letra_id]" value="1">
        <input name="letras[0][ciudad_id]" value="1">
        <input name="letras[0][librador_persona_id]" value="1">
        <input name="letras[0][librado_persona_id]" value="1">
        <textarea name="letras[0][detalles_indicacion]">Detalles indicación</textarea>
        <input name="letras[0][aceptante_persona_id]" value="1">
        <input name="letras[0][domiciliado_persona_id]" value="1">
        <input name="letras[0][indicado_persona_id]" value="1">

        <!-- Roles adicionales (letra) -->
        <div id="letraRolesContainer_0">
          <div class="rol-adicional-container">
            <input type="hidden" name="letras[0][roles_adicionales][][id_rol]" value="6">
            <input type="text" class="persona-search" value="Ana García">
            <input type="hidden" name="letras[0][roles_adicionales][][persona_id]" value="11">
            <input type="text" class="ciudad-search" value="Barcelona">
            <input type="hidden" name="letras[0][roles_adicionales][][ciudad_id]" value="21">
          </div>
        </div>

        <!-- Comentario letra -->
        <textarea id="comentario_letra_0" name="letras[0][comentario]">Comentario de la letra</textarea>

        <!-- Endosos -->
        <div id="endososContainer_0">
          <div class="endoso-section" id="endoso_0_0">
            <input name="letras[0][endosos][0][fecha]" value="2025-03-15">
            <input name="letras[0][endosos][0][importe]" value="500">
            <input name="letras[0][endosos][0][moneda_id]" value="1">
            <input name="letras[0][endosos][0][ciudad_id]" value="1">
            <input name="letras[0][endosos][0][endosante_persona_id]" value="1">
            <input name="letras[0][endosos][0][endosado_persona_id]" value="1">

            <!-- Roles adicionales (endoso) -->
            <div id="endosoRolesContainer_0_0">
              <div class="rol-adicional-container">
                <input type="hidden" name="letras[0][endosos][0][roles_adicionales][][id_rol]" value="7">
                <input type="text" class="persona-search" value="Pedro Martínez">
                <input type="hidden" name="letras[0][endosos][0][roles_adicionales][][persona_id]" value="12">
                <input type="text" class="ciudad-search" value="Valencia">
                <input type="hidden" name="letras[0][endosos][0][roles_adicionales][][ciudad_id]" value="22">
              </div>
            </div>

            <!-- Comentario endoso -->
            <textarea id="comentario_endoso_0_0" name="letras[0][endosos][0][comentario]">Comentario del endoso</textarea>
          </div>
        </div>
      </div>
    </div>
  </form>
</body>
</html>
`;

let window, document, $, ajaxMock;

// Construye el DOM y jQuery antes de cada test
beforeEach(() => {
  const dom = new JSDOM(domTemplate, { url: 'http://localhost' });
  window = dom.window;
  document = window.document;
  global.window = window;
  global.document = document;
  global.navigator = { userAgent: 'node.js' };
  $ = require('jquery')(window);
  global.$ = $;
  global.jQuery = $;
  // Mock de alert/confirm por si acaso
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);
  // Mock de AJAX
  ajaxMock = jest.spyOn($, 'ajax').mockImplementation(() => {});
});

// Función auxiliar: recoge toda la información como hace la app y simula el envío
function recopilarYEnviar() {
  const d = {
    archivo: $('input[name="archivo"]').val(),
    protocolo: $('input[name="protocolo"]').val(),
    pagina: $('input[name="pagina"]').val(),
    fecha_protesto: $('input[name="fecha_protesto"]').val(),
    escribano_id: $('input[name="escribano_id"]').val(),
    ciudad_protesto_id: $('input[name="ciudad_protesto_id"]').val(),
    protestante_persona_id: $('input[name="protestante_persona_id"]').val(),
    protestante_ciudad_id: $('input[name="protestante_ciudad_id"]').val(),
    tipo_letra_protesto_id: $('input[name="tipo_letra_protesto_id"]').val(),
    tipo_protesto_id: $('input[name="tipo_protesto_id"]').val(),
    motivo_impago: $('textarea[name="motivo_impago"]').val(),
    representante_persona_id: $('input[name="representante_persona_id"]').val(),
    presentado_persona_id: $('input[name="presentado_persona_id"]').val(),
    presentado_ciudad_id: $('input[name="presentado_ciudad_id"]').val(),
    detalles_abono: $('textarea[name="detalles_abono"]').val(),
    abona_persona_id: $('input[name="abona_persona_id"]').val(),
    abona_ciudad_id: $('input[name="abona_ciudad_id"]').val(),
    cedido_persona_id: $('input[name="cedido_persona_id"]').val(),
    cedido_ciudad_id: $('input[name="cedido_ciudad_id"]').val(),
    letras: []
  };

  // Roles adicionales del protesto
  const protestoRoles = [];
  $('#protestoRolesContainer .rol-adicional-container').each(function () {
    protestoRoles.push({
      id_rol: $(this).find('input[name^="roles_protesto"][name$="[id_rol]"]').val(),
      id_persona: $(this).find('input[name^="roles_protesto"][name$="[persona_id]"]').val(),
      id_ciudad: $(this).find('input[name^="roles_protesto"][name$="[ciudad_id]"]').val(),
      persona_nombre: $(this).find('.persona-search').val(),
      ciudad_nombre: $(this).find('.ciudad-search').val()
    });
  });
  if (protestoRoles.length) d.roles_adicionales = protestoRoles;

  // Comentario del protesto
  const cProtesto = $('#comentario_protesto').val();
  if (cProtesto) d.comentario_protesto = cProtesto;

  // Letras y sus endosos
  $('.letra-section').each(function () {
    const i = $(this).attr('id').split('_')[1];
    const L = {
      importe: $(`input[name="letras[${i}][importe]"]`).val(),
      moneda_id: $(`input[name="letras[${i}][moneda_id]"]`).val(),
      fecha_emision: $(`input[name="letras[${i}][fecha_emision]"]`).val(),
      fecha_vencimiento: $(`input[name="letras[${i}][fecha_vencimiento]"]`).val(),
      tipo_letra_id: $(`input[name="letras[${i}][tipo_letra_id]"]`).val(),
      ciudad_id: $(`input[name="letras[${i}][ciudad_id]"]`).val(),
      librador_persona_id: $(`input[name="letras[${i}][librador_persona_id]"]`).val(),
      librado_persona_id: $(`input[name="letras[${i}][librado_persona_id]"]`).val(),
      detalles_indicacion: $(`textarea[name="letras[${i}][detalles_indicacion]"]`).val(),
      aceptante_persona_id: $(`input[name="letras[${i}][aceptante_persona_id]"]`).val(),
      domiciliado_persona_id: $(`input[name="letras[${i}][domiciliado_persona_id]"]`).val(),
      indicado_persona_id: $(`input[name="letras[${i}][indicado_persona_id]"]`).val(),
      endosos: []
    };

    // Roles adicionales de la letra
    const rolesL = [];
    $(`#letraRolesContainer_${i} .rol-adicional-container`).each(function () {
      rolesL.push({
        id_rol: $(this).find(`input[name^="letras[${i}][roles_adicionales]"][name$="[id_rol]"]`).val(),
        id_persona: $(this).find(`input[name^="letras[${i}][roles_adicionales]"][name$="[persona_id]"]`).val(),
        id_ciudad: $(this).find(`input[name^="letras[${i}][roles_adicionales]"][name$="[ciudad_id]"]`).val(),
        persona_nombre: $(this).find('.persona-search').val(),
        ciudad_nombre: $(this).find('.ciudad-search').val()
      });
    });
    if (rolesL.length) L.roles_adicionales = rolesL;

    // Comentario de la letra
    const cL = $(`#comentario_letra_${i}`).val();
    if (cL) L.comentario = cL;

    // Endosos
    $(`#endososContainer_${i} .endoso-section`).each(function () {
      const j = $(this).attr('id').split('_')[2];
      const E = {
        fecha: $(`input[name="letras[${i}][endosos][${j}][fecha]"]`).val(),
        importe: $(`input[name="letras[${i}][endosos][${j}][importe]"]`).val(),
        moneda_id: $(`input[name="letras[${i}][endosos][${j}][moneda_id]"]`).val(),
        ciudad_id: $(`input[name="letras[${i}][endosos][${j}][ciudad_id]"]`).val(),
        endosante_persona_id: $(`input[name="letras[${i}][endosos][${j}][endosante_persona_id]"]`).val(),
        endosado_persona_id: $(`input[name="letras[${i}][endosos][${j}][endosado_persona_id]"]`).val()
      };

      // Roles adicionales del endoso
      const rolesE = [];
      $(`#endosoRolesContainer_${i}_${j} .rol-adicional-container`).each(function () {
        rolesE.push({
          id_rol: $(this).find(`input[name^="letras[${i}][endosos][${j}][roles_adicionales]"][name$="[id_rol]"]`).val(),
          id_persona: $(this).find(`input[name^="letras[${i}][endosos][${j}][roles_adicionales]"][name$="[persona_id]"]`).val(),
          id_ciudad: $(this).find(`input[name^="letras[${i}][endosos][${j}][roles_adicionales]"][name$="[ciudad_id]"]`).val(),
          persona_nombre: $(this).find('.persona-search').val(),
          ciudad_nombre: $(this).find('.ciudad-search').val()
        });
      });
      if (rolesE.length) E.roles_adicionales = rolesE;

      // Comentario del endoso
      const cE = $(`#comentario_endoso_${i}_${j}`).val();
      if (cE) E.comentario = cE;

      L.endosos.push(E);
    });

    d.letras.push(L);
  });

  $.ajax({
    url: '/formulario/save',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(d)
  });

  return d;
}

// Tests

test('Construye y envía el objeto con roles y comentarios', () => {
  const d = recopilarYEnviar();
  expect(ajaxMock).toHaveBeenCalledTimes(1);

  const sent = JSON.parse(ajaxMock.mock.calls[0][0].data);

  // Protesto: roles + comentario
  expect(sent.roles_adicionales).toHaveLength(1);
  expect(sent.roles_adicionales[0]).toMatchObject({
    id_rol: '5', id_persona: '10', id_ciudad: '20',
    persona_nombre: 'Juan Pérez', ciudad_nombre: 'Madrid'
  });
  expect(sent.comentario_protesto).toBe('Comentario del protesto');

  // Letra: campos clave, roles y comentario
  expect(sent.letras).toHaveLength(1);
  expect(sent.letras[0]).toMatchObject({
    importe: '1000',
    fecha_emision: '2025-03-01',
    fecha_vencimiento: '2025-04-01'
  });
  expect(sent.letras[0].roles_adicionales).toHaveLength(1);
  expect(sent.letras[0].roles_adicionales[0]).toMatchObject({
    id_rol: '6', id_persona: '11', id_ciudad: '21',
    persona_nombre: 'Ana García', ciudad_nombre: 'Barcelona'
  });
  expect(sent.letras[0].comentario).toBe('Comentario de la letra');

  // Endoso: campos clave, roles y comentario
  expect(sent.letras[0].endosos).toHaveLength(1);
  expect(sent.letras[0].endosos[0]).toMatchObject({
    fecha: '2025-03-15', importe: '500', moneda_id: '1'
  });
  expect(sent.letras[0].endosos[0].roles_adicionales).toHaveLength(1);
  expect(sent.letras[0].endosos[0].roles_adicionales[0]).toMatchObject({
    id_rol: '7', id_persona: '12', id_ciudad: '22',
    persona_nombre: 'Pedro Martínez', ciudad_nombre: 'Valencia'
  });
  expect(sent.letras[0].endosos[0].comentario).toBe('Comentario del endoso');
});

test('Funciona también sin roles ni comentarios', () => {
  $('#protestoRolesContainer').remove();
  $('#letraRolesContainer_0').remove();
  $('#endosoRolesContainer_0_0').remove();
  $('#comentario_protesto').remove();
  $('#comentario_letra_0').remove();
  $('#comentario_endoso_0_0').remove();

  const d = recopilarYEnviar();
  const sent = JSON.parse(ajaxMock.mock.calls[0][0].data);

  // Sin roles/comentarios no rompe estructura
  expect((sent.roles_adicionales || []).length).toBe(0);
  expect(sent.letras[0].roles_adicionales).toBeUndefined();
  expect(sent.letras[0].comentario).toBeUndefined();
  expect(sent.letras[0].endosos[0].roles_adicionales).toBeUndefined();
  expect(sent.letras[0].endosos[0].comentario).toBeUndefined();

  // Campos básicos siguen presentes
  expect(sent.archivo).toBe('Archivo1');
  expect(sent.letras[0].importe).toBe('1000');
});

test('Acepta IDs nuevos como cadenas (sin convertir)', () => {
  $('input[name="roles_protesto[][id_rol]"]').val('nuevo_rol_1');
  $('input[name="roles_protesto[][persona_id]"]').val('nueva_persona_1');
  $('input[name="letras[0][roles_adicionales][][ciudad_id]"]').val('nueva_ciudad_1');

  recopilarYEnviar();
  const sent = JSON.parse(ajaxMock.mock.calls[0][0].data);

  expect(sent.roles_adicionales[0].id_rol).toBe('nuevo_rol_1');
  expect(sent.roles_adicionales[0].id_persona).toBe('nueva_persona_1');
  expect(sent.letras[0].roles_adicionales[0].id_ciudad).toBe('nueva_ciudad_1');
});