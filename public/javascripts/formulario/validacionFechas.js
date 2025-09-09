function initValidacionFechas() {
    console.log('Inicializando validación de fechas...');
    
    $('input[type="date"]').each(function() {
        const $this = $(this);
        
        $this.removeAttr('max');
        $this.removeAttr('min');
        
        $this.on('change', function() {
            validateDateField($(this));
        });
    });
    
    $(document).on('change', 'input[name*="fecha_emision"]', function() {
        validateDateField($(this));
    });
}

function validateDateField($field) {
    const value = $field.val();
    const fieldName = $field.attr('name') || $field.attr('id') || 'fecha';
    
    if (!value) {
        $field.removeClass('is-invalid');
        return true;
    }

    $field.removeClass('is-invalid');
    hideDateError($field);
    return true;
}

function validateFechaVencimiento($field) {
    const fieldName = $field.attr('name');
    
    if (!fieldName) return true;
    
    return validateDateField($field);
}

function showDateError($field, message) {
    hideDateError($field);

    const errorDiv = $(`<div class="invalid-feedback">${message}</div>`);
    $field.after(errorDiv);
}

function hideDateError($field) {
    $field.siblings('.invalid-feedback').remove();
}

// Función para validar fechas del formulario
function validateAllDates() {
    let hasErrors = false;
    
    $('input[type="date"]').each(function() {
        if (!validateDateField($(this))) {
            hasErrors = true;
        }
    });
    
    return !hasErrors;
}

// Exportar funciones
window.initValidacionFechas = initValidacionFechas;
window.validateAllDates = validateAllDates;
window.validateDateField = validateDateField;