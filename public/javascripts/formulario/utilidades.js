function toggleSection(checkbox, sectionId) {
  const section = document.getElementById(sectionId);
  
  if (!section) {
    console.error(`No se encontró la sección con ID: ${sectionId}`);
    return;
  }
  
  if (checkbox.checked) {
    section.classList.remove('d-none');
    section.classList.add('show');

    const inputs = section.querySelectorAll('input, select, textarea');
    inputs.forEach(input => { input.removeAttribute('disabled'); });

    // Re-inicializar búsquedas con el nuevo gestor
    if (window.GestorBusquedas) {
      GestorBusquedas.iniciarPersonas();
      GestorBusquedas.iniciarCiudades();
      GestorBusquedas.iniciarMonedas();
      GestorBusquedas.iniciarTiposLetra();
      GestorBusquedas.iniciarTiposProtesto();
      GestorBusquedas.iniciarTiposValor();
    }
    console.log(`Sección ${sectionId} habilitada`);
  } else {
    section.classList.add('d-none');
    section.classList.remove('show');
    
    // Deshabilitar y limpiar campos dentro de la sección
    const inputs = section.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type !== 'hidden') {
        input.value = '';
        input.setAttribute('disabled', 'disabled');
      }
    });
    
    console.log(`Sección ${sectionId} deshabilitada`);
  }
  
  // Actualizar orden de tabulación si la función existe
  if (typeof configurarOrdenTabulacion === 'function') {
    setTimeout(configurarOrdenTabulacion, 100);
  }
}

// Función alternativa con jQuery
function toggleSectionJQuery(checkbox, sectionId) {
  const $section = $(`#${sectionId}`);
  const $checkbox = $(checkbox);
  
  if (!$section.length) {
    console.error(`No se encontró la sección con ID: ${sectionId}`);
    return;
  }
  
  if ($checkbox.is(':checked')) {
    $section.removeClass('d-none').addClass('show');
    
    // Habilitar campos
    $section.find('input, select, textarea').prop('disabled', false);
    
    // Re-inicializar búsquedas
    if (window.GestorBusquedas) {
      GestorBusquedas.iniciarPersonas();
      GestorBusquedas.iniciarCiudades();
      GestorBusquedas.iniciarMonedas();
      GestorBusquedas.iniciarTiposLetra();
      GestorBusquedas.iniciarTiposProtesto();
      GestorBusquedas.iniciarTiposValor();
    }
    console.log(`Sección ${sectionId} habilitada`);
  } else {
    $section.addClass('d-none').removeClass('show');
    
    // Deshabilitar y limpiar campos
    $section.find('input:not([type="hidden"]), select, textarea').val('').prop('disabled', true);
    
    console.log(`Sección ${sectionId} deshabilitada`);
  }
  
  // Actualizar tabulación
  if (typeof configurarOrdenTabulacion === 'function') {
    setTimeout(configurarOrdenTabulacion, 100);
  }
}

function normalizePersonaName(nombre) {
  return nombre.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findExistingPersonaByName(nombreCompleto, callback) {
  const normalizedName = normalizePersonaName(nombreCompleto);
  $.ajax({
    url: '/personas',
    method: 'GET',
    success: function(data) {
      const found = (data || []).find(p => {
        const full = `${p.nombre} ${p.apellidos || ''}`.trim();
        return normalizePersonaName(full) === normalizedName;
      });
      callback(null, found || null);
    },
    error: function(xhr, status, error) {
      console.error('Error buscando persona:', error);
      callback(error, null);
    }
  });
}

function validateOrCreatePersona(nombreCompleto, callback) {
  if (!nombreCompleto || nombreCompleto.trim() === '') {
    return callback(new Error('Nombre de persona vacío'), null);
  }
  if (!isNaN(nombreCompleto)) {
    return callback(null, parseInt(nombreCompleto));
  }
  findExistingPersonaByName(nombreCompleto, (err, existingPersona) => {
    if (err) return callback(err, null);
    if (existingPersona) {
      return callback(null, existingPersona.id_persona);
    }
    const [nombre, ...apellidosParts] = nombreCompleto.split(' ');
    const apellidos = apellidosParts.join(' ');
    $.ajax({
      url: '/personas',
      method: 'POST',
      data: { nombre, apellidos },
      success: function(data) {
        callback(null, data.id_persona);
      },
      error: function(xhr, status, error) {
        console.error('Error creando persona:', error);
        callback(error, null);
      }
    });
  });
}

function validateAllPersonasInForm(callback) {
  const personaFields = [];
  
  // Recopilar todos los campos de persona del formulario
  $('.persona-search').each(function() {
    const $input = $(this);
    const value = $input.val();
    
    if (value && value.trim() !== '' && !isNaN(value) === false) {
      personaFields.push({
        input: $input,
        value: value.trim(),
        hiddenField: $input.siblings('input[type="hidden"]').first()
      });
    }
  });
  
  if (personaFields.length === 0) {
    return callback();
  }
  
  let processed = 0;
  let hasErrors = false;
  
  personaFields.forEach(field => {
    validateOrCreatePersona(field.value, (err, personaId) => {
      processed++;
      
      if (err) {
        hasErrors = true;
        console.error(`Error validando persona ${field.value}:`, err);
      } else {
        // Actualizar el campo oculto con el ID correcto
        if (field.hiddenField.length > 0) {
          field.hiddenField.val(personaId);
        }
      }
      
      if (processed === personaFields.length) {
        if (hasErrors) {
          callback(new Error('Errores validando personas'));
        } else {
          callback();
        }
      }
    });
  });
}

// Exportar funciones globalmente
window.toggleSection = toggleSection;
window.toggleSectionJQuery = toggleSectionJQuery;
window.normalizePersonaName = normalizePersonaName;
window.findExistingPersonaByName = findExistingPersonaByName;
window.validateOrCreatePersona = validateOrCreatePersona;
window.validateAllPersonasInForm = validateAllPersonasInForm;