$(document).ready(function() {
    loadLastProtestoData();
});


function loadLastProtestoData() {
    $.ajax({
        url: '/formulario/last-protesto',
        method: 'GET',
        success: function(data) {
            if (data && Object.keys(data).length > 0) {
                autoFillFormFields(data);
            } else {
                console.log('No hay protestos anteriores para autorrellenar');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error cargando último protesto:', error);
        }
    });
}

function autoFillFormFields(data) {
    let fieldsAutofilled = false;
    
    // Autorrellenar archivo
    if (data.archivo) {
        $('input[name="archivo"]').val(data.archivo).addClass('auto-filled');
        fieldsAutofilled = true;
    }
    
    // Autorrellenar protocolo
    if (data.protocolo) {
        $('input[name="protocolo"]').val(data.protocolo).addClass('auto-filled');
        fieldsAutofilled = true;
    }
    
    // Autorrellenar escribano
    if (data.escribano_id && data.escribano_nombre) {
        const escribanoSearch = $('.persona-search[data-for="escribano"]');
        escribanoSearch.val(data.escribano_nombre).addClass('auto-filled');
        $('input[name="escribano_id"]').val(data.escribano_id);
        fieldsAutofilled = true;
    }
    
    // Autorrellenar ciudad del protesto
    if (data.ciudad_protesto_id && data.ciudad_nombre) {
        const ciudadSearch = $('.ciudad-search[data-for="protesto_ciudad"]');
        ciudadSearch.val(data.ciudad_nombre).addClass('auto-filled');
        $('input[name="ciudad_protesto_id"]').val(data.ciudad_protesto_id);
        fieldsAutofilled = true;
    }
}

