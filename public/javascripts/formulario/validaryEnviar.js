function validateForm() {
  const errors = [];
  
  // Validar que los ID de personas y ciudades correspondan a entidades reales no son números escritos como nombres
  $('.persona-search').each(function() {
    const value = $(this).val();
    const label = $(this).closest('.col-md-3, .col-md-6').find('label').text() || 'Campo de persona';

    // validar 
    if (value && value.trim() !== '' && !isNaN(value)) {
      errors.push(`El campo ${label} no puede contener solo números como nombre`);
    }
  });
  
  $('.ciudad-search').each(function() {
    const value = $(this).val();
    const label = $(this).closest('.col-md-3, .col-md-6').find('label').text() || 'Campo de ciudad';

    // Validar
    if (value && value.trim() !== '' && !isNaN(value)) {
      errors.push(`El campo ${label} no puede contener solo números como nombre`);
    }
  });

  // Validar letras y sus importes
  $('.letra-section').each(function() {
    const letraIndex = $(this).attr('id').split('_')[1];
    const importeInput = $(`input[name="letras[${letraIndex}][importe]"]`);
    const importe = importeInput.val();
    
    if (importe && importe.trim() !== '') {
      const importeRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
      if (!importeRegex.test(importe)) {
        errors.push(`El importe de la letra ${parseInt(letraIndex) + 1} debe ser un número válido`);
        importeInput.addClass('is-invalid');
      } else if (parseFloat(importe) <= 0) {
        errors.push(`El importe de la letra ${parseInt(letraIndex) + 1} debe ser mayor que cero`);
        importeInput.addClass('is-invalid');
      } else {
        importeInput.removeClass('is-invalid');
      }
    } else {
      importeInput.removeClass('is-invalid');
    }
  });

  // Validar endosos
  $('.endoso-section').each(function() {
    const endosoId = $(this).attr('id');
    const parts = endosoId.split('_');
    const letraIndex = parts[1];
    const endosoIndex = parts[2];
    
    const importeInput = $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][importe]"]`);
    const importe = importeInput.val();
    
    if (importe && importe.trim() !== '') {
      const importeRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
      if (!importeRegex.test(importe)) {
        errors.push(`El importe del endoso ${parseInt(endosoIndex) + 1} de la letra ${parseInt(letraIndex) + 1} debe ser un número válido`);
        importeInput.addClass('is-invalid');
      } else if (parseFloat(importe) <= 0) {
        errors.push(`El importe del endoso ${parseInt(endosoIndex) + 1} de la letra ${parseInt(letraIndex) + 1} debe ser mayor que cero`);
        importeInput.addClass('is-invalid');
      } else {
        importeInput.removeClass('is-invalid');
      }
    } else {
      importeInput.removeClass('is-invalid');
    }
  });
  
  return errors;
}

function normalizeDateForSQL(value) {
  if (window.CommonUtils && CommonUtils.fechas) {
    return CommonUtils.fechas.normalizeForSQL(value);
  }
  if (!value) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split('/');
    return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const dt = new Date(value);
  if (!isNaN(dt.getTime())) {
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

$('#protestoForm').on('submit', function(event) {
  event.preventDefault();
  
  const errors = validateForm();
  
  if (errors.length > 0) {
    const errorsList = $('#validationErrorsList');
    errorsList.empty();
    
    errors.forEach(error => {
      errorsList.append(`<li class="list-group-item list-group-item-danger">${error}</li>`);
    });
    
    $('#validationErrorsModal').modal('show');
    return;
  }
  
  if (!confirm('¿Está seguro de enviar este formulario?')) {
    return;
  }

  console.log('Enviando formulario...');
  $('#loadingSpinner').removeClass('d-none');

  // Recopilar datos
  const protestoData = {
    archivo: $('input[name="archivo"]').val(),
    protocolo: $('input[name="protocolo"]').val(),
    pagina: $('input[name="pagina"]').val(),
    fecha_protesto: $('input[name="fecha_protesto"]').val(),
    escribano_id: $('input[name="escribano_id"]').val(),
    ciudad_protesto_id: $('input[name="ciudad_protesto_id"]').val(),
    protestante_persona_id: $('input[name="protestante_persona_id"]').val(),
    protestado_persona_id: $('input[name="protestado_persona_id"]').val(),
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

    comentario: $('textarea[name="comentario_protesto"]').val(),
    letras: []
  };

  $('.letra-section').each(function() {
    const letraIndex = $(this).attr('id').split('_')[1];
    
    // Datos de la letra
    const letra = {
      fecha_emision: $(`input[name="letras[${letraIndex}][fecha_emision]"]`).val(),
      fecha_vencimiento: $(`input[name="letras[${letraIndex}][fecha_vencimiento]"]`).val(),
      importe: $(`input[name="letras[${letraIndex}][importe]"]`).val(),
      moneda_id: $(`input[name="letras[${letraIndex}][moneda_id]"]`).val(),
      ciudad_id: $(`input[name="letras[${letraIndex}][ciudad_id]"]`).val(),
      tipo_letra_id: $(`input[name="letras[${letraIndex}][tipo_letra_id]"]`).val(),
      valor: $(`input[name="letras[${letraIndex}][valor]"]`).val(),

      librador_persona_id: $(`input[name="letras[${letraIndex}][librador_persona_id]"]`).val(),
      librador_ciudad_id: $(`input[name="letras[${letraIndex}][librador_ciudad_id]"]`).val(),
      librado_persona_id: $(`input[name="letras[${letraIndex}][librado_persona_id]"]`).val(),
      librado_ciudad_id: $(`input[name="letras[${letraIndex}][librado_ciudad_id]"]`).val(),
      
      ordenante_persona_id: $(`input[name="letras[${letraIndex}][ordenante_persona_id]"]`).val(),
      ordenante_ciudad_id: $(`input[name="letras[${letraIndex}][ordenante_ciudad_id]"]`).val(),
      beneficiario_persona_id: $(`input[name="letras[${letraIndex}][beneficiario_persona_id]"]`).val(),
      beneficiario_ciudad_id: $(`input[name="letras[${letraIndex}][beneficiario_ciudad_id]"]`).val(),
      
      aceptante_persona_id: $(`input[name="letras[${letraIndex}][aceptante_persona_id]"]`).val(),
      aceptante_ciudad_id: $(`input[name="letras[${letraIndex}][aceptante_ciudad_id]"]`).val(),
      domiciliado_persona_id: $(`input[name="letras[${letraIndex}][domiciliado_persona_id]"]`).val(),
      domiciliado_ciudad_id: $(`input[name="letras[${letraIndex}][domiciliado_ciudad_id]"]`).val(),
      indicado_persona_id: $(`input[name="letras[${letraIndex}][indicado_persona_id]"]`).val(),
      indicado_ciudad_id: $(`input[name="letras[${letraIndex}][indicado_ciudad_id]"]`).val(),
      detalles_indicacion: $(`textarea[name="letras[${letraIndex}][detalles_indicacion]"]`).val(),
      
      comentario: $(`textarea[name="letras[${letraIndex}][comentario]"]`).val(),

      endosos: []
    };
    
    // Endosos de la letra
    $(`#endososContainer_${letraIndex} .endoso-section`).each(function() {
      const endosoId = $(this).attr('id');
      const endosoParts = endosoId.split('_');
      const endosoIndex = endosoParts[2];
  
      const endoso = {
        endosante_persona_id: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][endosante_persona_id]"]`).val(),
        endosante_ciudad_id: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][endosante_ciudad_id]"]`).val(),
        endosado_persona_id: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][endosado_persona_id]"]`).val(),
        endosado_ciudad_id: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][endosado_ciudad_id]"]`).val(),
        fecha: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][fecha]"]`).val(),
        fecha_endoso : $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][fecha_endoso]"]`).val(),
        valor: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][valor]"]`).val(),
        importe: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][importe]"]`).val(),
        moneda_id: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][moneda_id]"]`).val(),
        ciudad_id: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][ciudad_id]"]`).val(),

        comentario: $(`textarea[name="letras[${letraIndex}][endosos][${endosoIndex}][comentario]"]`).val(),

        poderhabiente_endosante_persona_id: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][poderhabiente_endosante_persona_id]"]`).val(),
        poderhabiente_endosante_ciudad_id: $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][poderhabiente_endosante_ciudad_id]"]`).val()
      };
      
      const rawFecha = $(this).find('input[type="date"], input[name*="fecha_endoso"], input[name*="fecha"]').first().val();
      const fechaEndoso = normalizeDateForSQL(rawFecha);
      endoso.fecha_endoso = fechaEndoso;
      
      letra.endosos.push(endoso);
    });
    
    protestoData.letras.push(letra);
  });
  
  // Obtener roles adicionales
  const rolesData = getRolesAdicionalesData();

  // 1. Añadir roles adicionales al protesto
  if (rolesData.protestoRoles.length > 0) {
    protestoData.roles_adicionales = rolesData.protestoRoles;
    console.log('Roles adicionales del protesto agregados al objeto:', rolesData.protestoRoles);
  }
  
  // 2. Añadir roles adicionales a cada letra
  for (const letraIndex in rolesData.letrasRoles) {
    if (rolesData.letrasRoles[letraIndex] && rolesData.letrasRoles[letraIndex].length > 0) {
      if (protestoData.letras[letraIndex]) {
        if (!Array.isArray(protestoData.letras[letraIndex].roles_adicionales)) {
          protestoData.letras[letraIndex].roles_adicionales = [];
        }
        protestoData.letras[letraIndex].roles_adicionales.push(...rolesData.letrasRoles[letraIndex]);
      }
    }
  }

  // 3. Añadir roles adicionales a cada endoso
  for (const letraIndex in rolesData.endososRoles) {
    for (const endosoIndex in rolesData.endososRoles[letraIndex]) {
      if (rolesData.endososRoles[letraIndex][endosoIndex] &&
          rolesData.endososRoles[letraIndex][endosoIndex].length > 0) {
        if (protestoData.letras[letraIndex] && protestoData.letras[letraIndex].endosos[endosoIndex]) {
          if (!Array.isArray(protestoData.letras[letraIndex].endosos[endosoIndex].roles_adicionales)) {
            protestoData.letras[letraIndex].endosos[endosoIndex].roles_adicionales = [];
          }
          protestoData.letras[letraIndex].endosos[endosoIndex].roles_adicionales.push(
            ...rolesData.endososRoles[letraIndex][endosoIndex]
          );
        }
      }
    }
  }

  console.log('Datos completos a enviar:', protestoData);
  
  // Enviar
  $.ajax({
    url: '/formulario/save',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(protestoData),
    success: function(response) {
      $('#loadingSpinner').addClass('d-none');
      if (response.success) {
        alert('Protesto guardado correctamente');
        window.location.href = '/formulario';
      } else {
        alert('Error al guardar: ' + (response.error || 'Error desconocido'));
      }
    },
    error: function(xhr, status, error) {
      $('#loadingSpinner').addClass('d-none');
      console.error('Error en la petición:', xhr.responseText);
      let errorMsg = 'Error al guardar el protesto. ';
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.error) {
          errorMsg += response.error;
          if (response.details) errorMsg += ": " + response.details;
        }
      } catch (e) {
        errorMsg += 'Por favor, intente nuevamente.';
      }
      alert(errorMsg);
    }
  });
});

function getRolesAdicionalesData() {
  // Para el protesto
  const protestoRoles = [];
  $('#protestoRolesContainer .rol-adicional-container').each(function() {
    const id_rol = $(this).find('input[name^="roles_protesto["][name$="[id_rol]"]').val();
    const persona_id = $(this).find('input[name^="roles_protesto["][name$="[persona_id]"]').val();
    const ciudad_id = $(this).find('input[name^="roles_protesto["][name$="[ciudad_id]"]').val();
    const persona_nombre = $(this).find('.persona-search').val();
    const ciudad_nombre = $(this).find('.ciudad-search').val();
    if (id_rol && persona_id) {
      protestoRoles.push({
        id_rol: parseInt(id_rol, 10),
        nombre_rol: getRolNameLocal(id_rol),
        id_persona: isNaN(persona_id) ? persona_id : parseInt(persona_id, 10),
        persona_nombre: persona_nombre,
        id_ciudad: ciudad_id ? parseInt(ciudad_id, 10) : null,
        ciudad_nombre: ciudad_nombre || 'N/A'
      });
    }
  });

  // Para las letras
  const letrasRoles = {};
  $('.letra-section').each(function() {
    const letraIndex = $(this).attr('id').split('_')[1];
    letrasRoles[letraIndex] = [];
    $(`#letraRolesContainer_${letraIndex} .rol-adicional-container`).each(function() {
      const id_rol = $(this).find(`input[name^="letras[${letraIndex}][roles_adicionales]"][name$="[id_rol]"]`).val();
      const persona_id = $(this).find(`input[name^="letras[${letraIndex}][roles_adicionales]"][name$="[persona_id]"]`).val();
      const ciudad_id = $(this).find(`input[name^="letras[${letraIndex}][roles_adicionales]"][name$="[ciudad_id]"]`).val();
      const persona_nombre = $(this).find('.persona-search').val();
      const ciudad_nombre = $(this).find('.ciudad-search').val();
      if (id_rol && persona_id) {
        letrasRoles[letraIndex].push({
          id_rol: parseInt(id_rol, 10),
          nombre_rol: getRolNameLocal(id_rol),
          id_persona: isNaN(persona_id) ? persona_id : parseInt(persona_id, 10),
          persona_nombre,
          id_ciudad: ciudad_id ? parseInt(ciudad_id, 10) : null,
          ciudad_nombre: ciudad_nombre || 'N/A'
        });
      }
    });
  });

  // Para los endosos
  const endososRoles = {};
  $('.endoso-section').each(function() {
    const endosoId = $(this).attr('id');
    const parts = endosoId.split('_');
    const letraIndex = parts[1];
    const endosoIndex = parts[2];
    if (!endososRoles[letraIndex]) endososRoles[letraIndex] = {};
    endososRoles[letraIndex][endosoIndex] = [];
    $(`#endosoRolesContainer_${letraIndex}_${endosoIndex} .rol-adicional-container`).each(function() {
      const id_rol = $(this).find(`input[name^="letras[${letraIndex}][endosos][${endosoIndex}][roles_adicionales]"][name$="[id_rol]"]`).val();
      const persona_id = $(this).find(`input[name^="letras[${letraIndex}][endosos][${endosoIndex}][roles_adicionales]"][name$="[persona_id]"]`).val();
      const ciudad_id = $(this).find(`input[name^="letras[${letraIndex}][endosos][${endosoIndex}][roles_adicionales]"][name$="[ciudad_id]"]`).val();
      const persona_nombre = $(this).find('.persona-search').val();
      const ciudad_nombre = $(this).find('.ciudad-search').val();
      if (id_rol && persona_id) {
        endososRoles[letraIndex][endosoIndex].push({
          id_rol: parseInt(id_rol, 10),
          nombre_rol: getRolNameLocal(id_rol),
          id_persona: isNaN(persona_id) ? persona_id : parseInt(persona_id, 10),
          persona_nombre,
          id_ciudad: ciudad_id ? parseInt(ciudad_id, 10) : null,
          ciudad_nombre: ciudad_nombre || 'N/A'
        });
      }
    });
  });

  return { protestoRoles, letrasRoles, endososRoles };
}

function getRolNameLocal(idRol) {
  if (typeof rolesCache !== 'undefined' && rolesCache[idRol]) {
    return rolesCache[idRol];
  }
  return `Rol ${idRol}`;
}