// function openMonedaModal(identifier) {   
//     currentMonedaInput = identifier;
//     $('#monedaModal').modal('show');
//     loadMonedas();
// }
  
// function loadMonedas(searchTerm = '') {
//     $.ajax({
//       url: '/monedas',
//       method: 'GET',
//       success: function(data) {
//         const monedaList = $('#monedaList');
//         monedaList.empty();
        
//         data.forEach(moneda => {
//           monedaList.append(`
//             <button type="button" class="list-group-item list-group-item-action"
//                     onclick="selectMoneda(${moneda.id_moneda}, '${moneda.nombre_moneda}')">
//               ${moneda.nombre_moneda}
//             </button>
//           `);
//         });
//       }
//     });
// }
  

// function selectMoneda(id, nombre) {
//     if (typeof SearchAPI !== 'undefined') {
//         SearchAPI.selectMoneda(id, nombre, currentMonedaInput);
//     } else {
//         console.warn('SearchAPI no disponible, usando lógica legacy');
//     }
//     $('#monedaModal').modal('hide');
// }

function initMonedaSearches() {
     GestorBusquedas.iniciarMonedas();  
}

function openAddMonedaModal() {
    $('#monedaModal').modal('hide');
    $('#addMonedaModal').modal('show');
}

$('#addMonedaForm').on('submit', function(event) {
    event.preventDefault();
    const formData = $(this).serialize();
    $.ajax({
        url: '/monedas',
        method: 'POST',
        data: formData,
        success: function(data) {
            $('#addMonedaModal').modal('hide');
            loadMonedas();
        }
    });
});

