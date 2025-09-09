class BuscadorEntidades {
    static inicializarBuscadorEntidad(config) {
        const {
            inputSelector,
            suggestionsSelector,
            hiddenInputSelector,
            searchUrl,
            entityName,
            idField,
            searchFields = ['nombre'],
            minLength = 2,
            onSelect = null,
            formatDisplay = null,
            formatSuggestion = null
        } = config;

        $(inputSelector).off('input.entitySearch');
        $(document).off('click.entitySearchSuggestions');

        $(inputSelector).each(function() {
            const searchInput = $(this);
            let suggestionsContainer = searchInput.siblings(suggestionsSelector);
            if (!suggestionsContainer.length) {
                // crear contenedor si no existe
                suggestionsContainer = $(`<div class="${suggestionsSelector.replace('.', '')}"></div>`);
                searchInput.after(suggestionsContainer);
            }
            const hiddenInput = searchInput.siblings(hiddenInputSelector);
            let timeoutId;

            // Estado inicial
            if (hiddenInput.val() && !isNaN(hiddenInput.val())) {
                searchInput.addClass(`existing-${entityName}`).removeClass(`new-${entityName}`);
            } else if (hiddenInput.val() && isNaN(hiddenInput.val())) {
                searchInput.addClass(`new-${entityName}`).removeClass(`existing-${entityName}`);
            }

            searchInput.on('input.entitySearch', function() {
                clearTimeout(timeoutId);
                const query = $(this).val();

                if (query.length < minLength) {
                    suggestionsContainer.empty().hide();
                    searchInput.removeClass(`existing-${entityName} new-${entityName} searching`);
                    hiddenInput.val('');
                    return;
                }

                searchInput.addClass('searching');

                timeoutId = setTimeout(() => {
                    $.get(`${searchUrl}?q=${encodeURIComponent(query)}`)
                        .done(function(entities) {
                            searchInput.removeClass('searching');
                            suggestionsContainer.empty();

                            if (entities && entities.length > 0) {
                                // Coincidencia exacta
                                const exactMatch = entities.find(entity =>
                                    searchFields.some(field =>
                                        entity[field] && String(entity[field]).toLowerCase() === query.toLowerCase()
                                    )
                                );

                                const getId = (e) => {
                                    const key = idField || `id_${entityName}`;
                                    return e[key];
                                };

                                if (exactMatch && getId(exactMatch)) {
                                    const displayValue = formatDisplay ? formatDisplay(exactMatch) : exactMatch[searchFields[0]];
                                    hiddenInput.val(getId(exactMatch));
                                    searchInput.val(displayValue);
                                    searchInput.addClass(`existing-${entityName}`).removeClass(`new-${entityName}`);
                                    suggestionsContainer.hide();
                                    return;
                                }

                                // Sugerencias
                                entities.forEach(entity => {
                                    const suggestionContent =
                                        (formatSuggestion ? formatSuggestion(entity) : entity[searchFields[0]]) || '';

                                    const item = $(`<div class="suggestion-item ${entityName}-suggestion">${suggestionContent}</div>`);

                                    item.on('click', function() {
                                        const displayValue = formatDisplay ? formatDisplay(entity) : entity[searchFields[0]];
                                        const entityId = getId(entity);
                                        if (entityId !== undefined) hiddenInput.val(entityId);
                                        searchInput.val(displayValue);
                                        searchInput.addClass(`existing-${entityName}`).removeClass(`new-${entityName}`);
                                        suggestionsContainer.hide();

                                        if (onSelect) onSelect(entity, searchInput);
                                    });

                                    suggestionsContainer.append(item);
                                });

                                suggestionsContainer.show();
                            } else {
                                // Valor nuevo libre
                                searchInput.addClass(`new-${entityName}`).removeClass(`existing-${entityName}`);
                                hiddenInput.val(query);
                                suggestionsContainer.hide();
                            }
                        })
                        .fail(function(err) {
                            searchInput.removeClass('searching');
                            console.error(`Error buscando ${entityName}:`, err);
                        });
                }, 300);
            });
        });

        $(document).on('click.entitySearchSuggestions', function(e) {
            if (!$(e.target).closest(`${inputSelector}, ${suggestionsSelector}`).length) {
                $(suggestionsSelector).hide();
            }
        });
    }

    static seleccionarEntidad(entityId, displayValue, config) {
        const { targetInput, hiddenInput, entityName, onSelect = null } = config;
        if (hiddenInput) hiddenInput.val(entityId);
        if (targetInput) {
            targetInput.val(displayValue);
            targetInput.addClass(`existing-${entityName}`).removeClass(`new-${entityName}`);
        }
        if (onSelect) onSelect(entityId, displayValue);
    }
}

window.BuscadorEntidades = BuscadorEntidades;