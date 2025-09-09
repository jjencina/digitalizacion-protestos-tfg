const SearchConfigs = {
    persona: {
        inputSelector: '.persona-search',
        suggestionsSelector: '.persona-suggestions',
        hiddenInputSelector: 'input[type="hidden"]',
        searchUrl: '/personas/search',
        entityName: 'persona',
        idField: 'id_persona',
        searchFields: ['nombre', 'apellidos'],
        formatDisplay: (p) => `${p.nombre} ${p.apellidos || ''}`,
        formatSuggestion: (p) => `${p.nombre} ${p.apellidos || ''} <small class="text-muted">${p.pais || ''}</small>`
    },
    ciudad: {
        inputSelector: '.ciudad-search',
        suggestionsSelector: '.ciudad-suggestions',
        hiddenInputSelector: 'input[type="hidden"]',
        searchUrl: '/ciudades/search',
        entityName: 'ciudad',
        idField: 'id_ciudad',
        searchFields: ['nombre_ciudad'],
        formatDisplay: (c) => c.nombre_ciudad,
        formatSuggestion: (c) => `${c.nombre_ciudad} <small class="text-muted">${c.pais || ''}</small>`
    },
    moneda: {
        inputSelector: '.moneda-search',
        suggestionsSelector: '.moneda-suggestions',
        hiddenInputSelector: 'input[type="hidden"]',
        searchUrl: '/monedas/search',
        entityName: 'moneda',
        idField: 'id_moneda',
        searchFields: ['nombre_moneda'],
        minLength: 1,
        formatDisplay: (m) => m.nombre_moneda,
        formatSuggestion: (m) => `${m.nombre_moneda} <small class="text-muted">${m.nombre_moneda.substring(0,3).toUpperCase()}</small>`
    },
    tipoLetra: {
        inputSelector: '.tipo-letra-search',
        suggestionsSelector: '.tipo-letra-suggestions',
        hiddenInputSelector: 'input[type="hidden"]',
        searchUrl: '/letra/tipos/letra/search',
        entityName: 'tipo',
        idField: 'id_tipo_letra',
        searchFields: ['nombre'],
        formatDisplay: (t) => t.nombre,
        formatSuggestion: (t) => t.nombre
    },
    tipoProtesto: {
        inputSelector: '.tipo-protesto-search',
        suggestionsSelector: '.tipo-protesto-suggestions',
        hiddenInputSelector: 'input[type="hidden"]',
        searchUrl: '/protesto/tipos/protestos/search',
        entityName: 'tipo',
        idField: 'id_tipo_protesto',
        searchFields: ['nombre'],
        formatDisplay: (t) => t.nombre,
        formatSuggestion: (t) => t.nombre
    },
    tipoValor: {
        inputSelector: '.tipo-valor-search',
        suggestionsSelector: '.tipo-valor-suggestions',
        hiddenInputSelector: 'input[type="hidden"]',
        searchUrl: '/letra/tipos/valor/search',
        entityName: 'tipo',
        idField: 'id_tipo_valor',
        searchFields: ['nombre'],
        formatDisplay: (t) => t.nombre,
        formatSuggestion: (t) => t.nombre
    }
};
window.SearchConfigs = SearchConfigs;