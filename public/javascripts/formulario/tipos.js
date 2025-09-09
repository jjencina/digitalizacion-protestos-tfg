function loadTipos() {
    return Promise.all([
        $.get('/letra/tipos/letra'),
        $.get('/letra/tipos/valor'),
        $.get('/letra/tipos/plazo'),
        $.get('/endoso/tipos/negociacion'),
        $.get('/protesto/tipos/protestos') 
    ]).then(([letra, valor, plazo, negociacion, protestos]) => {
        tiposLetra = letra;
        tiposValor = valor;
        tiposPlazo = plazo;
        tiposNegociacion = negociacion;
        tiposProtesto = protestos;
        updateTiposSelects();
        return {tiposLetra, tiposValor, tiposPlazo, tiposNegociacion, tiposProtesto};
    }).catch(err => {
        alert('Error cargando tipos necesarios. Por favor, recargue la página.');
    });
}

function populateMainNegociacionSelect() {
    const select = $('#tipo_negociacion');
    select.empty();
    tiposNegociacion.forEach(tipo => {
        select.append(`<option value="${tipo.id_tipo_negociacion}">${tipo.nombre}</option>`);
    });
}

function updateTiposSelects() {
    // Tipo de letra del protesto
    const tipoLetraProtestoSelect = $('#tipo_letra_protesto');
    tipoLetraProtestoSelect.empty();
    tipoLetraProtestoSelect.append('<option value="">Seleccione un tipo</option>');
    if (tiposLetra && tiposLetra.length) {
        tiposLetra.forEach(t => {
            tipoLetraProtestoSelect.append(`<option value="${t.id_tipo_letra}">${t.nombre}</option>`);
        });
    }

    // Tipo de protesto
    const tipoProtestoSelect = $('#tipo_protesto');
    tipoProtestoSelect.empty();
    tipoProtestoSelect.append('<option value="">Seleccione un tipo</option>');
    if (tiposProtesto && tiposProtesto.length) {
        tiposProtesto.forEach(t => {
            tipoProtestoSelect.append(`<option value="${t.id_tipo_protesto}">${t.nombre}</option>`);
        });
    }

    // Tipo de valor letra
    $('select[id^="tipo_valor_"]').each(function() {
        $(this).empty();
        $(this).append('<option value="">Seleccione un tipo</option>');
        if (tiposValor && tiposValor.length) {
            tiposValor.forEach(t => {
                $(this).append(`<option value="${t.id_tipo_valor}">${t.nombre}</option>`);
            });
        }
    });

    // Tipo de plazo letra
    $('select[id^="tipo_plazo_"]').each(function() {
        $(this).empty();
        $(this).append('<option value="">Seleccione un tipo</option>');
        if (tiposPlazo && tiposPlazo.length) {
            tiposPlazo.forEach(t => {
                $(this).append(`<option value="${t.id_tipo_plazo}">${t.nombre}</option>`);
            });
        }
    });

    // Tipo de negociacion letra
    $('select[id^="tipo_negociacion_"]').each(function() {
        $(this).empty();
        $(this).append('<option value="">Seleccione un tipo</option>');
        if (tiposNegociacion && tiposNegociacion.length) {
            tiposNegociacion.forEach(t => {
                $(this).append(`<option value="${t.id_tipo_negociacion}">${t.nombre}</option>`);
            });
        }
    });
}

// Mantener funciones viejas (no se usan?)
function selectTipoLetra(id, nombre) {
    const searchInput = $('.tipo-letra-search:focus');
    const dataFor = searchInput.data('for');
    
    if (dataFor) {
        SearchAPI.selectTipoLetra(id, nombre, dataFor);
    }
    
    searchInput.siblings('.tipo-letra-suggestions').hide();
}

function selectTipoProtesto(id, nombre) {
    SearchAPI.selectTipoProtesto(id, nombre, 'protesto');
    $('.tipo-protesto-suggestions').hide();
}

function initTipoLetraSearches() {
    SearchAPI.initTipoLetraSearches();
}

function initTipoProtestoSearches() {
    SearchAPI.initTipoProtestoSearches();
}

function initTipoValorSearches() {
    SearchAPI.initTipoValorSearches();
}