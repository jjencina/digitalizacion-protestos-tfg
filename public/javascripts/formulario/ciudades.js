// function openSelectCiudadModal(index) {
//     currentCiudadInput = index;
//     $('#selectCiudadModal').modal('show');
//     loadCiudades();
// }

// function loadCiudades(searchTerm = '') {
//     $.ajax({
//       url: '/ciudades',
//       method: 'GET',
//       success: function(data) {
//         const ciudadesList = $('#ciudadesList');
//         ciudadesList.empty();
        
//         data.filter(ciudad => 
//           ciudad.nombre_ciudad.toLowerCase().includes((searchTerm || '').toLowerCase())
//         ).forEach(ciudad => {
//           ciudadesList.append(`
//             <button type="button" class="list-group-item list-group-item-action" 
//                     onclick="selectCiudad(${ciudad.id_ciudad}, '${ciudad.nombre_ciudad}')">
//               ${ciudad.nombre_ciudad} - ${ciudad.pais}
//             </button>
//           `);
//         });
//       }
//     });
// }

// function selectCiudad(id, nombre) {
//     if (typeof SearchAPI !== 'undefined') {
//         SearchAPI.selectCiudad(id, nombre, currentCiudadInput);
//     } else {
//         console.warn('SearchAPI no disponible, usando lógica legacy');
//     }
//     $('#selectCiudadModal').modal('hide');
// }

function initCiudadSearches() {
    GestorBusquedas.iniciarCiudades();
}

function openAddCiudadModal() {
    $('#selectCiudadModal').modal('hide');
    $('#addCiudadModal').modal('show');
}

$('#addCiudadForm').on('submit', function(event) {
    event.preventDefault();
    const formData = $(this).serialize();
    $.ajax({
        url: '/ciudades',
        method: 'POST',
        data: formData,
        success: function(data) {
            $('#addCiudadModal').modal('hide');
            loadCiudades();
        }
    });
});
