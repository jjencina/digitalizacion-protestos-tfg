let letraCount = 0;
let endosoCount = {};

function addLetra() {
  const letraIndex = letraCount;
  const letrasContainer = document.getElementById('letrasContainer');
  if (!letrasContainer) {
    console.error('No se encontró #letrasContainer');
    return;
  }

  endosoCount[letraIndex] = 0;

  const letraHTML = `
    <div class="card letra-section" id="letra_${letraIndex}">
      <div class="card-header d-flex justify-content-between">
        <h6 class="mb-0">Letra ${letraIndex + 1}</h6>
        <div>
          <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeLetra(${letraIndex})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
      <div class="card-body">
        <!-- Campos existentes de la letra -->
        ${getLetraFieldsHTML(letraIndex)}
        
        <!-- Contenedor para campos adicionales -->
        <div id="letraFieldsContainer_${letraIndex}"></div>
        
        <!-- Contenedor para roles adicionales -->
        <div id="letraRolesContainer_${letraIndex}" class="row g-2 mt-2 roles-container"></div>
        
        <!-- Botón Añadir más campos ANTES de la sección de endosos -->
        <div class="mt-3">
          <a href="#" class="text-decoration-none" data-bs-toggle="modal" data-bs-target="#addCamposModal" data-section="letra_${letraIndex}">
            <i class="bi bi-plus-circle"></i> Añadir más campos
          </a>
        </div>
        
        <!-- Contenedor de endosos -->
        <div class="mt-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">Endosos</h6>
            <!-- Importante: usar addEndosoForButton(this) para resolver la letra desde el DOM -->
            <button type="button" class="btn btn-secondary btn-sm btn-add-endoso" onclick="addEndosoForButton(this)">
              <i class="bi bi-plus"></i> Añadir Endoso
            </button>
          </div>
          <div id="endososContainer_${letraIndex}"></div>
        </div>
      </div>
    </div>
  `;

  $('#letrasContainer').append(letraHTML);

  // Re-inicializar búsquedas para elementos recién añadidos
  if (window.GestorBusquedas) {
    GestorBusquedas.iniciarPersonas();
    GestorBusquedas.iniciarCiudades();
    GestorBusquedas.iniciarMonedas();
    GestorBusquedas.iniciarTiposLetra();
    GestorBusquedas.iniciarTiposProtesto();
    GestorBusquedas.iniciarTiposValor();
  }

  letraCount++;

  // Notificar orden de tabulación cuando cambia algo
  if (typeof notificarLetraAgregada === 'function') notificarLetraAgregada(letraIndex);
  if (typeof configurarOrdenTabulacion === 'function') configurarOrdenTabulacion();
}

function removeLetra(letraIndex) {
  if(confirm('¿Está seguro de eliminar esta letra de cambio?')) {
    $(`#letra_${letraIndex}`).remove();
    // Limpiar contador de endosos para esta letra
    delete endosoCount[letraIndex];
  }
}

function removeEndoso(letraIndex, endosoIndex) {
  if (!Number.isInteger(parseInt(letraIndex)) || !Number.isInteger(parseInt(endosoIndex))) return;
  if (confirm('¿Está seguro de eliminar este endoso?')) {
    const $endoso = $(`#endoso_${letraIndex}_${endosoIndex}`);
    if ($endoso.length) {
      $endoso.remove();
      $(document).trigger('endosoRemoved', [letraIndex, endosoIndex]);
      if (typeof configurarOrdenTabulacion === 'function') {
        setTimeout(configurarOrdenTabulacion, 100);
      }
    }
  }
}

// Función para manejar el autocompletado de endosante desde endosado anterior
function setupEndosoChaining() {
  $(document).on('input change', '.persona-search[data-for*="endosado_"]', function() {
    const $this = $(this);
    const dataFor = $this.attr('data-for');
    
    // Extraer índices del endoso actual brujeria para que funcione esta mierda
    const matches = dataFor.match(/endosado_(\d+)_(\d+)/);
    if (!matches) return;
    
    const letraIndex = parseInt(matches[1]);
    const endosoIndex = parseInt(matches[2]);
    const nextEndosoIndex = endosoIndex + 1;
    
    // Verificar si existe el siguiente endoso 
    const nextEndosoContainer = $(`#endoso_${letraIndex}_${nextEndosoIndex}`);
    if (nextEndosoContainer.length === 0) return;
    
    // Obtener datos del endosado actual
    const personaValue = $this.val();
    const personaId = $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][endosado_persona_id]"]`).val();
    
    // Copiar al endosante del siguiente endoso
    const nextEndosanteSearch = $(`input[data-for="endosante_${letraIndex}_${nextEndosoIndex}"]`);
    const nextEndosanteId = $(`input[name="letras[${letraIndex}][endosos][${nextEndosoIndex}][endosante_persona_id]"]`);
    
    if (nextEndosanteSearch.length && nextEndosanteId.length) {
      nextEndosanteSearch.val(personaValue);
      nextEndosanteId.val(personaId);
    }
  });
  
  // Autocompletar campo ciudad y persona de endosante con endosado del anterior endoso
  $(document).on('input change', '.ciudad-search[data-for*="endosado_ciudad_"]', function() {
    const $this = $(this);
    const dataFor = $this.attr('data-for');
    
    // Extraer índices del endoso actual
    const matches = dataFor.match(/endosado_ciudad_(\d+)_(\d+)/);
    if (!matches) return;
    
    const letraIndex = parseInt(matches[1]);
    const endosoIndex = parseInt(matches[2]);
    const nextEndosoIndex = endosoIndex + 1;
    
    // Verificar si existe siguiente endoso
    const nextEndosoContainer = $(`#endoso_${letraIndex}_${nextEndosoIndex}`);
    if (nextEndosoContainer.length === 0) return;
    
    // Obtener datos de la ciudad del endosado actual
    const ciudadValue = $this.val();
    const ciudadId = $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][endosado_ciudad_id]"]`).val();
    
    // Copiar a la ciudad del endosante del siguiente endoso
    const nextEndosanteCiudadSearch = $(`input[data-for="endosante_ciudad_${letraIndex}_${nextEndosoIndex}"]`);
    const nextEndosanteCiudadId = $(`input[name="letras[${letraIndex}][endosos][${nextEndosoIndex}][endosante_ciudad_id]"]`);
    
    if (nextEndosanteCiudadSearch.length && nextEndosanteCiudadId.length) {
      nextEndosanteCiudadSearch.val(ciudadValue);
      nextEndosanteCiudadId.val(ciudadId);
    }
  });
}

// Función para manejar cuando se selecciona una persona desde las sugerencias
function setupPersonaSuggestionChaining() {
  $(document).on('click', '.persona-suggestion', function() {
    const $suggestion = $(this);
    const $searchGroup = $suggestion.closest('.persona-search-group');
    const $personaSearch = $searchGroup.find('.persona-search');
    const dataFor = $personaSearch.attr('data-for');
    
    if (dataFor && dataFor.includes('endosado_')) {
      setTimeout(() => {
        $personaSearch.trigger('change');
      }, 100);
    }
  });
}

// Función para manejar cuando se selecciona una ciudad desde las sugerencias
function setupCiudadSuggestionChaining() {
  $(document).on('click', '.ciudad-suggestion', function() {
    const $suggestion = $(this);
    const $searchGroup = $suggestion.closest('.ciudad-search-group');
    const $ciudadSearch = $searchGroup.find('.ciudad-search');
    const dataFor = $ciudadSearch.attr('data-for');
    
    if (dataFor && dataFor.includes('endosado_ciudad_')) {
      setTimeout(() => {
        $ciudadSearch.trigger('change');
      }, 100);
    }
  });
}

function addEndosoForButton(btn) {
  // Detectar la letra a partir del botón pulsado
  const $card = $(btn).closest('.letra-section');
  if (!$card.length) {
    console.error('No se encontró la sección de letra para el botón pulsado');
    return;
  }
  const id = $card.attr('id');
  const parts = (id || '').split('_');
  const letraIndex = parseInt(parts[1], 10);
  if (Number.isNaN(letraIndex)) {
    console.error('No se pudo determinar el índice de la letra para añadir endoso');
    return;
  }
  addEndoso(letraIndex);
}

function addEndoso(letraIndex) {
  const endosoIndex = endosoCount[letraIndex] ?? 0;
  const endososContainer = document.getElementById(`endososContainer_${letraIndex}`);
  if (!endososContainer) {
    console.error(`No se encontró el contenedor de endosos para la letra ${letraIndex}`);
    return;
  }

  const endosoHTML = `
    <div class="card endoso-section mb-2" id="endoso_${letraIndex}_${endosoIndex}">
      <div class="card-header d-flex justify-content-between text-white bg-dark">
        <h6 class="mb-0">Endoso ${endosoIndex + 1}</h6>
        <div>
          <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeEndoso(${letraIndex}, ${endosoIndex})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
      <div class="card-body">
        ${getEndosoFieldsHTML(letraIndex, endosoIndex)}
        
        <!-- Contenedor para campos adicionales -->
        <div id="endosoFieldsContainer_${letraIndex}_${endosoIndex}"></div>
        
        <!-- Contenedor para roles adicionales -->
        <div id="endosoRolesContainer_${letraIndex}_${endosoIndex}" class="row g-2 mt-2 roles-container"></div>

        <div class="mt-3">
          <a href="#" class="text-decoration-none" data-bs-toggle="modal" data-bs-target="#addCamposModal" data-section="endoso_${letraIndex}_${endosoIndex}">
            <i class="bi bi-plus-circle"></i> Añadir más campos
          </a>
        </div>
      </div>
    </div>
  `;

  $(`#endososContainer_${letraIndex}`).append(endosoHTML);

  // Inicializaciones
  if (window.GestorBusquedas) {
    GestorBusquedas.iniciarPersonas();
    GestorBusquedas.iniciarCiudades();
    GestorBusquedas.iniciarMonedas();
  }

  const importeInput = $(`input[name="letras[${letraIndex}][endosos][${endosoIndex}][importe]"]`);
  if (typeof initImporteValidation === 'function') initImporteValidation(importeInput);

  endosoCount[letraIndex] = endosoIndex + 1;

  // Notificaciones o eventos
  $(document).trigger('endosoAdded', [letraIndex, endosoIndex]);
  if (typeof configurarOrdenTabulacion === 'function') configurarOrdenTabulacion();
}

// Función para generar el HTML de la letra
function getLetraFieldsHTML(letraIndex) {
  return `
    <div class="row g-3">
      <!-- Primera fila -->
      <div class="col-md-3">
        <label class="form-label">Fecha Emisión</label>
        <input type="date" class="form-control" name="letras[${letraIndex}][fecha_emision]">
      </div>
      
      <div class="col-md-3">
        <label class="form-label">Importe</label>
        <input type="text" class="form-control" name="letras[${letraIndex}][importe]" placeholder="0.00">
      </div>
      
      <div class="col-md-3">
        <label class="form-label">Moneda</label>
        <div class="moneda-search-group">
          <input type="text" class="form-control moneda-search" data-for="letra_${letraIndex}" placeholder="Moneda..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][moneda_id]">
          <div class="moneda-suggestions"></div>
        </div>
      </div>
      
      <div class="col-md-3">
        <label class="form-label">Vencimiento</label>
        <input type="text" class="form-control" name="letras[${letraIndex}][fecha_vencimiento]">
      </div>
    </div>

    <div class="row g-3 mt-2">
      <!-- Segunda fila -->
      <div class="col-md-3">
        <label class="form-label">Tipo de Letra</label> 
        <div class="tipo-letra-search-group">
          <input type="text" class="form-control tipo-letra-search" data-for="tipo_letra_${letraIndex}" placeholder="Tipo..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][tipo_letra_id]">
          <div class="tipo-letra-suggestions"></div>
        </div>
      </div>
      
      <div class="col-md-3">
        <label class="form-label">Ciudad</label>
        <div class="ciudad-search-group">
          <input type="text" class="form-control ciudad-search" data-for="ciudad_letra_${letraIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>

      <div class="col-md-3">
        <label class="form-label">Valor</label>
        <input type="text" class="form-control" name="letras[${letraIndex}][valor]">
      </div>
    </div>

    <!-- Roles principales -->
    <div class="row g-3 mt-3">
      <div class="col-md-3">
        <label class="form-label">Librador</label>
        <div class="persona-search-group">
          <input type="text" class="form-control persona-search" data-for="librador_${letraIndex}" placeholder="Nombre..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][librador_persona_id]">
          <div class="persona-suggestions"></div>
        </div>
        <div class="ciudad-search-group mt-2">
          <input type="text" class="form-control ciudad-search" data-for="librador_ciudad_${letraIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][librador_ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>
      
      <div class="col-md-3">
        <label class="form-label">Librado</label>
        <div class="persona-search-group">
          <input type="text" class="form-control persona-search" data-for="librado_${letraIndex}" placeholder="Nombre..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][librado_persona_id]">
          <div class="persona-suggestions"></div>
        </div>
        <div class="ciudad-search-group mt-2">
          <input type="text" class="form-control ciudad-search" data-for="librado_ciudad_${letraIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][librado_ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>

      <div class="col-md-3">
        <label class="form-label">Ordenante</label>
        <div class="persona-search-group">
          <input type="text" class="form-control persona-search" data-for="ordenante_${letraIndex}" placeholder="Nombre..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][ordenante_persona_id]">
          <div class="persona-suggestions"></div>
        </div>
        <div class="ciudad-search-group mt-2">
          <input type="text" class="form-control ciudad-search" data-for="ordenante_ciudad_${letraIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][ordenante_ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>

      <div class="col-md-3">
        <label class="form-label">Beneficiario</label>
        <div class="persona-search-group">
          <input type="text" class="form-control persona-search" data-for="beneficiario_${letraIndex}" placeholder="Nombre..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][beneficiario_persona_id]">
          <div class="persona-suggestions"></div>
        </div>
        <div class="ciudad-search-group mt-2">
          <input type="text" class="form-control ciudad-search" data-for="beneficiario_ciudad_${letraIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][beneficiario_ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>
    </div>

    <!-- Secciones opcionales -->
    <div class="mt-3">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" 
                onchange="toggleSectionVisibility(this, 'indicacion_${letraIndex}')"
                id="checkIndicacion_${letraIndex}">
        <label class="form-check-label">Añadir Indicación</label>
      </div>
      <div id="indicacion_${letraIndex}" class="mt-2" style="display: none;">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Indicado</label>
            <div class="persona-search-group">
              <input type="text" class="form-control persona-search" data-for="indicado_${letraIndex}" placeholder="Nombre..." autocomplete="off">
              <input type="hidden" name="letras[${letraIndex}][indicado_persona_id]">
              <div class="persona-suggestions"></div>
            </div>
            <div class="ciudad-search-group mt-2">
              <input type="text" class="form-control ciudad-search" data-for="indicado_ciudad_${letraIndex}" placeholder="Ciudad..." autocomplete="off">
              <input type="hidden" name="letras[${letraIndex}][indicado_ciudad_id]">
              <div class="ciudad-suggestions"></div>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Detalles de Indicación</label>
            <textarea class="form-control" name="letras[${letraIndex}][detalles_indicacion]" rows="3"></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" 
                onchange="toggleSectionVisibility(this, 'aceptacion_${letraIndex}')"
                id="checkAceptacion_${letraIndex}">
        <label class="form-check-label">Añadir Aceptación</label>
      </div>
      <div id="aceptacion_${letraIndex}" class="mt-2" style="display: none;">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Aceptante</label>
            <div class="persona-search-group">
              <input type="text" class="form-control persona-search" data-for="aceptante_${letraIndex}" placeholder="Nombre..." autocomplete="off">
              <input type="hidden" name="letras[${letraIndex}][aceptante_persona_id]">
              <div class="persona-suggestions"></div>
            </div>
            <div class="ciudad-search-group mt-2">
              <input type="text" class="form-control ciudad-search" data-for="aceptante_ciudad_${letraIndex}" placeholder="Ciudad..." autocomplete="off">
              <input type="hidden" name="letras[${letraIndex}][aceptante_ciudad_id]">
              <div class="ciudad-suggestions"></div>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Domiciliado</label>
            <div class="persona-search-group">
              <input type="text" class="form-control persona-search" data-for="domiciliado_${letraIndex}" placeholder="Nombre..." autocomplete="off">
              <input type="hidden" name="letras[${letraIndex}][domiciliado_persona_id]">
              <div class="persona-suggestions"></div>
            </div>
            <div class="ciudad-search-group mt-2">
              <input type="text" class="form-control ciudad-search" data-for="domiciliado_ciudad_${letraIndex}" placeholder="Ciudad..." autocomplete="off">
              <input type="hidden" name="letras[${letraIndex}][domiciliado_ciudad_id]">
              <div class="ciudad-suggestions"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Función HTML campos de endoso
function getEndosoFieldsHTML(letraIndex, endosoIndex) {
  return `
    <!-- Primera fila - datos básicos -->
    <div class="row g-3">
      <div class="col-md-3">
        <label class="form-label">Fecha Endoso</label>
        <input type="date" class="form-control" name="letras[${letraIndex}][endosos][${endosoIndex}][fecha_endoso]">
      </div>
      
      <div class="col-md-3">
        <label class="form-label">Valor</label>
        <input type="text" class="form-control" name="letras[${letraIndex}][endosos][${endosoIndex}][valor]" placeholder="Valor del endoso...">
      </div>
      
      <div class="col-md-3">
        <label class="form-label">Importe</label>
        <input type="number" step="0.01" class="form-control" name="letras[${letraIndex}][endosos][${endosoIndex}][importe]" placeholder="0.00">
      </div>
      
      <div class="col-md-3">
        <label class="form-label">Moneda</label>
        <div class="moneda-search-group">
          <input type="text" class="form-control moneda-search" data-for="endoso_${letraIndex}_${endosoIndex}" placeholder="Moneda..." readonly>
          <input type="hidden" name="letras[${letraIndex}][endosos][${endosoIndex}][moneda_id]">
          <div class="moneda-suggestions"></div>
        </div>
      </div>
    </div>

    <!-- Ciudad del Endoso -->
    <div class="row g-3 mt-3">
      <div class="col-md-3">
        <label class="form-label">Ciudad del Endoso</label>
        <div class="ciudad-search-group">
          <input type="text" class="form-control ciudad-search" data-for="endoso_ciudad_${letraIndex}_${endosoIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][endosos][${endosoIndex}][ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>
    </div>

    <!-- Roles del endoso con Poderhabiente -->
    <div class="row g-3 mt-3">
      <div class="col-md-4">
        <label class="form-label">Endosante</label>
        <div class="persona-search-group">
          <input type="text" class="form-control persona-search" data-for="endosante_${letraIndex}_${endosoIndex}" placeholder="Nombre..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][endosos][${endosoIndex}][endosante_persona_id]">
          <div class="persona-suggestions"></div>
        </div>
        <div class="ciudad-search-group mt-2">
          <input type="text" class="form-control ciudad-search" data-for="endosante_ciudad_${letraIndex}_${endosoIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][endosos][${endosoIndex}][endosante_ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>
      
      <div class="col-md-4">
        <label class="form-label">Poderhabiente del Endosante</label>
        <div class="persona-search-group">
          <input type="text" class="form-control persona-search" data-for="poderhabiente_endosante_${letraIndex}_${endosoIndex}" placeholder="Nombre..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][endosos][${endosoIndex}][poderhabiente_endosante_persona_id]">
          <div class="persona-suggestions"></div>
        </div>
        <div class="ciudad-search-group mt-2">
          <input type="text" class="form-control ciudad-search" data-for="poderhabiente_endosante_ciudad_${letraIndex}_${endosoIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][endosos][${endosoIndex}][poderhabiente_endosante_ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>
      
      <div class="col-md-4">
        <label class="form-label">Endosado</label>
        <div class="persona-search-group">
          <input type="text" class="form-control persona-search" data-for="endosado_${letraIndex}_${endosoIndex}" placeholder="Nombre..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][endosos][${endosoIndex}][endosado_persona_id]">
          <div class="persona-suggestions"></div>
        </div>
        <div class="ciudad-search-group mt-2">
          <input type="text" class="form-control ciudad-search" data-for="endosado_ciudad_${letraIndex}_${endosoIndex}" placeholder="Ciudad..." autocomplete="off">
          <input type="hidden" name="letras[${letraIndex}][endosos][${endosoIndex}][endosado_ciudad_id]">
          <div class="ciudad-suggestions"></div>
        </div>
      </div>
    </div>
  `;
}

// Función para mostrar/ocultar secciones
function toggleSectionVisibility(checkbox, sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = checkbox.checked ? 'block' : 'none';
  }
}

// Función para inicializar validación de importe
function initImporteValidation(inputElement) {
  inputElement.on('input', function() {
    const valor = $(this).val();
    // Permitir solo números y hasta 2 decimales
    const importeRegex = /^[0-9]*\.?[0-9]{0,2}$/;
    
    if (valor !== '' && !importeRegex.test(valor)) {
      // Si el valor no es válido, revertir al último valor válido
      const ultimoValorValido = $(this).data('ultimoValorValido') || '';
      $(this).val(ultimoValorValido);
    } else {
      // Si es válido, guardar como último valor válido
      $(this).data('ultimoValorValido', valor);
      $(this).removeClass('is-invalid');
    }
  });
}

// Función para inicializar todos los campos
function initAllImporteValidations() {
  $('input[name$="[importe]"]').each(function() {
    initImporteValidation($(this));
  });
}

window.addLetra = addLetra;
window.removeLetra = removeLetra;
window.addEndoso = addEndoso;
window.removeEndoso = removeEndoso;
window.toggleSectionVisibility = toggleSectionVisibility;
window.getLetraFieldsHTML = getLetraFieldsHTML;
window.getEndosoFieldsHTML = getEndosoFieldsHTML;
window.addEndosoForButton = addEndosoForButton;

// Inicializar
$(document).ready(function() {
  setupEndosoChaining();
  setupPersonaSuggestionChaining();
  setupCiudadSuggestionChaining();
});

