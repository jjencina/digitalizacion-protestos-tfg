// function openSelectPersonaModal(index) {
//     currentPersonaInput = index;
//     $('#selectPersonaModal').modal('show');
//     loadPersonas();
// }

// function loadPersonas(searchTerm = '') {
//     $.ajax({
//         url: '/personas',
//         method: 'GET',
//         success: function(data) {
//             console.log('Datos recibidos:', data);
//             const personasList = $('#personasList');
//             personasList.empty();
            
//             if (!personasList.length) {
//                 console.error('Element #personasList not found');
//                 return;
//             }
  
//             if (Array.isArray(data) && data.length > 0) {
//                 // Filtrar personas duplicadas por nombre completo
//                 const uniquePersonas = [];
//                 const seenNames = new Set();
                
//                 data.forEach(persona => {
//                     const fullName = `${persona.nombre} ${persona.apellidos}`.trim();
//                     if (!seenNames.has(fullName.toLowerCase())) {
//                         seenNames.add(fullName.toLowerCase());
//                         uniquePersonas.push(persona);
//                     }
//                 });
                
//                 uniquePersonas.forEach(persona => {
//                     const nombre = $('<div>').text(persona.nombre).html();
//                     const apellidos = $('<div>').text(persona.apellidos).html();
//                     const pais = $('<div>').text(persona.pais).html();
                    
//                     const button = $(`
//                         <button type="button" 
//                                 class="list-group-item list-group-item-action" 
//                                 onclick="selectPersona(${persona.id_persona}, '${nombre} ${apellidos}')">
//                             ${nombre} ${apellidos} - ${pais}
//                         </button>
//                     `);
                    
//                     personasList.append(button);
//                 });
//             } else {
//                 personasList.append(`
//                     <div class="list-group-item">
//                         No se encontraron personas
//                     </div>
//                 `);
//             }
//         },
//         error: function(xhr, status, error) {
//             console.error('Error al cargar personas:', {xhr, status, error});
//             $('#personasList').empty().append(`
//                 <div class="list-group-item text-danger">
//                     Error al cargar personas: ${error}
//                 </div>
//             `);
//         }
//     });
// }

// function selectPersona(id, nombre) {
//     // Antes de seleccionar, verificar si ya existe una persona con ese nombre
//     checkForDuplicatePersona(nombre, id);
// }

// Verificar duplicados
function checkForDuplicatePersona(nombre, selectedId) {
    $.ajax({
        url: '/personas',
        method: 'GET',
        success: function(data) {
            // Buscar si existe otra persona con el mismo nombre
            const duplicates = data.filter(persona => {
                const fullName = `${persona.nombre} ${persona.apellidos}`.trim();
                return fullName.toLowerCase() === nombre.toLowerCase() && persona.id_persona != selectedId;
            });
            
            if (duplicates.length > 0) {
                const existingPersona = duplicates[0];
                if (window.GestorBusquedas) {
                    GestorBusquedas.seleccionarPersona(existingPersona.id_persona, nombre, currentPersonaInput);
                }
            } else {
                if (window.GestorBusquedas) {
                    GestorBusquedas.seleccionarPersona(selectedId, nombre, currentPersonaInput);
                }
            }
            $('#selectPersonaModal').modal('hide');
        }
    });
}

function openAddPersonaModal() {
    $('#selectPersonaModal').modal('hide');
    $('#addPersonaModal').modal('show');
}

function initPersonaSearches() {
    if (window.GestorBusquedas) {
        GestorBusquedas.iniciarPersonas();
    }
}

$('#addPersonaForm').on('submit', function(event) {
    event.preventDefault();
    const formData = $(this).serialize();
    
    // Verificar si ya existe una persona con ese nombre antes de crear
    const nombre = $('#addPersonaForm input[name="nombre"]').val();
    const apellidos = $('#addPersonaForm input[name="apellidos"]').val();
    const fullName = `${nombre} ${apellidos}`.trim();
    
    // Usar la nueva función de validación
    if (typeof validateOrCreatePersona === 'function') {
        validateOrCreatePersona(fullName, (err, personaId) => {
            if (err) {
                console.error('Error creando/validando persona:', err);
                alert('Error al procesar la persona');
                return;
            }
            
            // Usar la persona (existente o nueva)
            if (typeof SearchAPI !== 'undefined') {
                SearchAPI.selectPersona(personaId, fullName, currentPersonaInput);
            }
            $('#addPersonaModal').modal('hide');
            loadPersonas();
        });
    } else {
        //Como se hacia antes con la calse persona.js
        $.ajax({
            url: '/personas',
            method: 'GET',
            success: function(data) {
                const existing = data.find(persona => {
                    const existingName = `${persona.nombre} ${persona.apellidos}`.trim();
                    return existingName.toLowerCase() === fullName.toLowerCase();
                });
                
                if (existing) {
                    // Usar persona existente
                    alert('Ya existe una persona con ese nombre. Se usará la persona existente.');
                    if (typeof SearchAPI !== 'undefined') {
                        SearchAPI.selectPersona(existing.id_persona, fullName, currentPersonaInput);
                    }
                    $('#addPersonaModal').modal('hide');
                    loadPersonas();
                } else {
                    // Crear nueva persona
                    $.ajax({
                        url: '/personas',
                        method: 'POST',
                        data: formData,
                        success: function(data) {
                            $('#addPersonaModal').modal('hide');
                            loadPersonas();
                        }
                    });
                }
            }
        });
    }
});
