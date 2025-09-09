let currentRolesContainer = '';
let currentRolesNamePrefix = '';
let currentRolesTipo = '';

function loadRolesParaAdicionales(tipoRol, containerId, namePrefix) {
  currentRolesContainer = containerId;
  currentRolesNamePrefix = namePrefix;
  currentRolesTipo = tipoRol;
  
  console.log('Cargando roles para:', { tipoRol, containerId, namePrefix });
  
  // Cargar los roles desde la base de datos según el tipo
  $.ajax({
    url: `/roles/tipo/${tipoRol}`,
    method: 'GET',
    success: function(data) {
      const rolesList = $('#rolesAdicionalesList');
      rolesList.empty();
      
      if (data && data.length > 0) {
        data.forEach(rol => {
          rolesList.append(`
            <button type="button" class="list-group-item list-group-item-action" 
                    onclick="addRolAdicional('${rol.id_rol}', '${rol.nombre_rol}')">
              ${rol.nombre_rol}
            </button>
          `);
        });
      } else {
        rolesList.append(`
          <div class="list-group-item">
            No hay roles disponibles para este tipo.
          </div>
        `);
      }
    },
    error: function(err) {
      console.error('Error cargando roles:', err);
      $('#rolesAdicionalesList').html(`
        <div class="list-group-item text-danger">
          Error al cargar los roles: ${err.responseText || err.statusText}
        </div>
      `);
    }
  });
  
  // Actualizar título de la modal
  const tipoTexto = tipoRol === 'protesto' ? 'protesto' : 
                    tipoRol === 'letracambio' ? 'letra de cambio' : 'endoso';
  $('#rolesAdicionalesModalLabel').text(`Roles de ${tipoTexto}`);
  
  // Mostrar el modal
  $('#rolesAdicionalesModal').modal('show');
}

function addRolAdicional(rolId, rolNombre) {
  console.log('Añadiendo rol:', { rolId, rolNombre, currentRolesContainer, currentRolesNamePrefix });
  
  $('#rolesAdicionalesModal').modal('hide');
  
  // Crear un ID único para este conjunto de campos de rol
  const rolUniqueId = `rol_adicional_${Date.now()}`;
  
  // Verificar que contenedor existe
  if (!$(`#${currentRolesContainer}`).length) {
    console.error('Contenedor de roles no encontrado:', currentRolesContainer);
    alert('Error: No se pudo encontrar el contenedor de roles');
    return;
  }
  
  // Añadir los campos al contenedor correspondiente
  $(`#${currentRolesContainer}`).append(`
    <div class="col-md-6 col-lg-4 mb-2 rol-adicional-container" id="${rolUniqueId}">
      <div class="card compact-card">
        <div class="card-header compact-header d-flex justify-content-between align-items-center p-2">
          <span class="small">${rolNombre}</span>
          <button type="button" class="btn-close compact-close" onclick="removeRolAdicional('${rolUniqueId}')"></button>
        </div>
        <div class="card-body compact-body p-2">
          <!-- Campo oculto para el ID del rol -->
          <input type="hidden" name="${currentRolesNamePrefix}[][id_rol]" value="${rolId}">
          
          <!-- Persona - Versión compacta -->
          <div class="mb-1">
            <label class="compact-label">Persona</label>
            <div class="persona-search-group">
              <input type="text" class="form-control form-control-sm compact-input persona-search" 
                     data-for="rol_persona_${rolUniqueId}" 
                     placeholder="Nombre..." 
                     autocomplete="off">
              <input type="hidden" name="${currentRolesNamePrefix}[][persona_id]">
              <div class="persona-suggestions"></div>
            </div>
          </div>
          
          <!-- Ciudad - Versión compacta -->
          <div class="mb-1">
            <label class="compact-label">Ciudad</label>
            <div class="ciudad-search-group">
              <input type="text" class="form-control form-control-sm compact-input ciudad-search" 
                     data-for="rol_ciudad_${rolUniqueId}" 
                     placeholder="Ciudad..." 
                     autocomplete="off">
              <input type="hidden" name="${currentRolesNamePrefix}[][ciudad_id]">
              <div class="ciudad-suggestions"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);
  
  // Notificar que se añadió un rol
  $(document).trigger('rolAdded', [currentRolesTipo, currentRolesContainer]);
    
  // Re-inicializar las búsquedas para estos campos nuevos
  if (window.GestorBusquedas) {
    GestorBusquedas.iniciarPersonas();
    GestorBusquedas.iniciarCiudades();
  }
  
  if (typeof SearchAPI !== 'undefined') {
    SearchAPI.initPersonaSearches();
    SearchAPI.initCiudadSearches();
  }
  
  console.log('Rol añadido fresco');
}

function removeRolAdicional(rolId) {
  if (confirm('¿Está seguro de que desea quitar este rol?')) {
    $(`#${rolId}`).fadeOut(300, function() {
      $(this).remove();
    });
  }
}

// Buscar en la lista de roles
$('#searchRolAdicional').on('input', function() {
  const searchTerm = $(this).val().toLowerCase();
  
  $('#rolesAdicionalesList button').each(function() {
    const text = $(this).text().toLowerCase();
    $(this).toggle(text.indexOf(searchTerm) > -1);
  });
});

// Función para abrir el modal de roles adicionales
window.openRolesAdicionalesModal = function(tipoRol, containerId, namePrefix) {
  loadRolesParaAdicionales(tipoRol, containerId, namePrefix);
};

window.loadRolesParaAdicionales = loadRolesParaAdicionales;
window.addRolAdicional = addRolAdicional;
window.removeRolAdicional = removeRolAdicional;