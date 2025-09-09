$(document).ready(function() {
    let currentEntity = 'protestos';
    let entityData = [];
    let currentEditId = null;

    // Usa los nombres centralizados en entityconfig.js
    function getEntityName(entityType) {
        return window.entityNames[entityType] || "Entidad";
    }
        
    // Expandir/colapsar filas anidadas
    $(document).on('click', '.expand-icon', function(e) {
        e.stopPropagation();
        const row = $(this).closest('tr');
        const protestoId = row.data('protesto-id');
        const letraId = row.data('letra-id');
        const isExpanded = row.hasClass('expanded');
        row.toggleClass('expanded');
        $(this).toggleClass('bi-chevron-right bi-chevron-down');
        
        if (row.hasClass('protesto-row')) {
            if (isExpanded) {
                $(`.letra-table-container[data-protesto-id="${protestoId}"]`).hide();
                $(`.letra-nested-row[data-protesto-id="${protestoId}"]`).removeClass('expanded');
                $(`.letra-nested-row[data-protesto-id="${protestoId}"] .expand-icon`)
                    .removeClass('bi-chevron-down').addClass('bi-chevron-right');
                $(`.endoso-table-container`).hide();
            } else {
                $(`.letra-table-container[data-protesto-id="${protestoId}"]`).show();
            }
        } else if (row.hasClass('letra-nested-row')) {
            if (isExpanded) {
                $(`.endoso-table-container[data-letra-id="${letraId}"]`).hide();
            } else {
                $(`.endoso-table-container[data-letra-id="${letraId}"]`).show();
            }
        }
    });
    
    // Estado inicial
    $('#protestosTableContainer').show();
    $('#entityTableContainer').hide();
    loadProtestos();
    updateAddButtonText();
    
    // Cambiar de entidad (pestañas)
    $('.entity-selector .btn').on('click', function() {
        $('.entity-selector .btn').removeClass('active');
        $(this).addClass('active');
        
        currentEntity = $(this).data('entity');
        
        if (currentEntity === 'protestos') {
            $('#protestosTableContainer').show();
            $('#entityTableContainer').hide();
            loadProtestos();
        } else {
            $('#protestosTableContainer').hide();
            $('#entityTableContainer').show();
            loadEntityData(currentEntity);
        }
        updateAddButtonText();
    });

    // Botón Añadir
    $('#btnAddEntity').on('click', function() {
        if (currentEntity === 'protestos') {
            window.location.href = '/formulario/';
        } else {
            showEditForm();
        }
    });
    
    // Búsqueda en tablas CRUD
    $('#entitySearchInput').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterEntityTable(searchTerm);
    });
    
    // Cargar datos de la entidad seleccionada (CRUD)
    function loadEntityData(entityType) {
        const config = entityConfig[entityType];
        if (!config) return;
        UtilidadesUI.mostrarCargandoEn('#entityTableContainer', 'Cargando datos...');
        $.get(config.endpoint, function(data) {
            entityData = data || [];
            renderEntityTable(entityType, entityData);
        }).fail(function() {
            UtilidadesUI.mostrarErrorEn('#entityTableContainer', 'Error al cargar datos.', { onRetry: () => loadEntityData(entityType) });
        });
    }
    
    // Loader
    function showLoader() {
        $('#entityTableContainer').html(`
            <div class="entity-loader">
                <div class="spinner-border text-primary" role="status">
                    <span class="visualmente-oculto">Cargando...</span>
                </div>
                <p class="mt-2">Cargando datos...</p>
            </div>
        `);
    }
    
    // Mensaje de error en contenedor CRUD
    function showError(message) {
        $('#entityTableContainer').html(`
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> ${message}
            </div>
        `);
    }
    
    // Render de tabla  CRUD
    function renderEntityTable(entityType, data) {
        const config = entityConfig[entityType];
        if (!config) return;

        let tableHTML = `
            <table class="table table-bordered table-hover" id="entityTable">
                <thead>
                    <tr>
                        ${config.columns.map(col => `<th style="width: ${col.width || 'auto'}">${col.title}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
            `;

        if (data && data.length > 0) {
            data.forEach(item => {
                tableHTML += '<tr>';
                config.columns.forEach(col => {
                    if (col.field === '_actions') {
                        tableHTML += `
                            <td>
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-primary btn-edit" data-id="${item[config.columns[0].field]}" title="Editar">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-danger btn-delete" data-id="${item[config.columns[0].field]}" title="Eliminar">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </td>
                        `;
                    } else if (col.field === 'protesto_detalles' || col.field === 'letra_detalles' || col.field === 'endoso_detalles') {
                        const value = item[col.field] || '';
                        tableHTML += `
                            <td>
                                <div class="relation-details">
                                    ${value.split(',').map(part => `<span>${part.trim()}</span>`).join('')}
                                </div>
                            </td>
                        `;
                    } else if (col.format === 'date' && item[col.field]) {
                        const date = new Date(item[col.field]);
                        tableHTML += `<td>${date.toLocaleDateString('es-ES')}</td>`;
                    } else if (col.format === 'number' && item[col.field]) {
                        const number = parseFloat(item[col.field]);
                        tableHTML += `<td>${new Intl.NumberFormat('es-ES').format(number)}</td>`;
                    } else {
                        let value = item[col.field];
                        if (value === null || value === undefined) value = '';
                        tableHTML += `<td>${value}</td>`;
                    }
                });
                tableHTML += '</tr>';
            });
        } else {
            tableHTML += `<tr><td colspan="${config.columns.length}" class="text-center text-muted">No hay datos disponibles</td></tr>`;
        }

        tableHTML += '</tbody></table>';

        $('#entityTableContainer').html(tableHTML);

        $('.btn-edit').on('click', function() {
            const id = $(this).data('id');
            editEntity(id);
        });

        $('.btn-delete').on('click', function() {
            const id = $(this).data('id');
            deleteEntity(id);
        });
    }
    
    // Filtro de búsqueda en CRUD
    function filterEntityTable(searchTerm) {
        if (!searchTerm) {
            renderEntityTable(currentEntity, entityData);
            return;
        }
        const filteredData = entityData.filter(item => {
            return Object.values(item).some(value => {
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(searchTerm);
            });
        });
        renderEntityTable(currentEntity, filteredData);
    }
    
    // Formatea inputs date YYYY-MM-DD
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    }

    // Formulario de edición/alta
    function showEditForm(data = null) {
        const config = entityConfig[currentEntity];
        const isEdit = !!data;
        currentEditId = isEdit ? data[config.columns[0].field] : null;
        
        let formHTML = `
            <div class="edit-form-container">
                <div class="edit-form">
                    <div class="edit-form-header">
                        <h5>${isEdit ? 'Editar' : 'Añadir'} ${getEntityName(currentEntity)}</h5>
                        <button type="button" class="btn-close" id="btnCloseForm"></button>
                    </div>
                    <form id="entityForm">
                        <div class="row g-3">
        `;
        
        for (const field of config.formFields) {
            let fieldValue = '';
            if (isEdit && data) {
                fieldValue = data[field.name];
                if (field.type === 'date' && fieldValue) fieldValue = formatDateForInput(fieldValue);
                if (fieldValue === null || fieldValue === undefined) fieldValue = '';
            }
            
            if (field.type === 'select') {
                formHTML += `
                    <div class="col-md-6">
                        <label for="${field.name}" class="form-label">${field.label}</label>
                        <select class="form-select" name="${field.name}" id="${field.name}" data-original-value="${fieldValue}">
                            <option value="">Seleccionar...</option>
                        </select>
                    </div>
                `;
            } else if (field.type === 'textarea') {
                formHTML += `
                    <div class="col-md-12">
                        <label for="${field.name}" class="form-label">${field.label}</label>
                        <textarea class="form-control" name="${field.name}" id="${field.name}" rows="3">${fieldValue}</textarea>
                    </div>
                `;
            } else {
                const additionalAttrs = field.type === 'number' && field.step ? `step="${field.step}"` : '';
                formHTML += `
                    <div class="col-md-6">
                        <label for="${field.name}" class="form-label">${field.label}</label>
                        <input type="${field.type}" class="form-control" name="${field.name}" id="${field.name}" value="${fieldValue}" ${additionalAttrs}>
                    </div>
                `;
            }
        }
        
        formHTML += `
                        </div>
                        <div class="edit-form-actions mt-3">
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-check-circle"></i> ${isEdit ? 'Guardar cambios' : 'Añadir'}
                            </button>
                            <button type="button" class="btn btn-secondary" id="btnCancelForm">
                                <i class="bi bi-x-circle"></i> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        $('#entityTableContainer').html(formHTML);
        
        $('#btnCloseForm, #btnCancelForm').on('click', function() {
            if (currentEntity === 'protestos') {
                $('#protestosTableContainer').show();
                $('#entityTableContainer').hide();
                loadProtestos();
            } else {
                loadEntityData(currentEntity);
            }
        });
        
        $('#entityForm').on('submit', function(e) {
            e.preventDefault();
            saveEntity();
        });
        
        loadSelectOptions(config, isEdit);
    }

    // Carga de opciones para selects
    function loadSelectOptions(config, isEdit) {
        const selectFields = config.formFields.filter(field => field.type === 'select');
        if (selectFields.length === 0) return;
        
        selectFields.forEach(field => {
            const $select = $(`#${field.name}`);
            const originalValue = $select.data('original-value');
            
            if (field.endpoint) {
                $.get(field.endpoint)
                    .done(function(optionsData) {
                        $select.find('option:not(:first)').remove();
                        optionsData.forEach(item => {
                            const option = new Option(item[field.displayField], item[field.valueField]);
                            $select.append(option);
                        });
                        if (isEdit && originalValue !== '' && originalValue !== null && originalValue !== undefined) {
                            $select.val(originalValue);
                            if ($select.val() !== String(originalValue)) {
                                console.warn(`Valor no encontrado para ${field.name}: ${originalValue}`);
                            }
                        }
                    })
                    .fail(function(error) {
                        console.error(`Error cargando opciones para ${field.name}:`, error);
                    });
            } else if (field.options) {
                field.options.forEach(option => {
                    $select.append(new Option(option.label, option.value));
                });
                if (isEdit && originalValue !== '' && originalValue !== null && originalValue !== undefined) {
                    $select.val(originalValue);
                }
            }
        });
    }

    function showSuccess(message) {
        UtilidadesUI.mostrarExitoEn('#entityTableContainer', message);
    }

    // Guardar alta/edición CRUD
    function saveEntity() {
        const config = entityConfig[currentEntity];
        const formData = $('#entityForm').serializeArray();
        const data = {};
        formData.forEach(field => { data[field.name] = field.value; });
        
        const method = currentEditId ? 'PUT' : 'POST';
        const url = currentEditId ? `${config.endpoint}/${currentEditId}` : config.endpoint;
        
        $.ajax({
            url,
            method,
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                if (currentEntity === 'protestos') {
                    $('#protestosTableContainer').show();
                    $('#entityTableContainer').hide();
                    loadProtestos();
                } else {
                    loadEntityData(currentEntity);
                }
                const entityName = getEntityName(currentEntity);
                const action = currentEditId ? 'actualizada' : 'creada';
                showSuccess(`${entityName} ${action} correctamente`);
            },
            error: function(error) {
                console.error("Error guardando entidad:", error);
                const entityName = getEntityName(currentEntity);
                let errorMessage = `Error al guardar ${entityName.toLowerCase()}.`;
                if (error.responseJSON?.error) {
                    errorMessage = error.responseJSON.error;
                } else if (error.responseJSON?.errores) {
                    errorMessage = `Errores de validación:\n${error.responseJSON.errores.join('\n')}`;
                }
                showError(errorMessage);
            }
        });
    }
    
    // Editar fila CRUD
    function editEntity(id) {
        const config = entityConfig[currentEntity];
        const entity = entityData.find(item => item[config.columns[0].field] === id);
        if (entity) showEditForm(entity);
    }
    
    // Eliminar fila CRUD
    function deleteEntity(id) {
        const config = entityConfig[currentEntity];
        const url = `${config.endpoint}/${id}`;
        if (!confirm("¿Está seguro de que desea eliminar esta entidad?")) return;
        $.ajax({
            url,
            method: 'DELETE',
            success: function() {
                loadEntityData(currentEntity);
                showSuccess("Entidad eliminada correctamente");
            },
            error: function(error) {
                console.error("Error eliminando entidad:", error);
                let errorMessage = "Error al eliminar la entidad. Inténtelo de nuevo.";
                if (error.responseJSON?.error) {
                    errorMessage = error.responseJSON.error;
                } else if (currentEntity === 'letras' && error.status === 500) {
                    errorMessage = "No se puede eliminar esta letra porque está en uso en protestos o endosos. Elimine primero esas relaciones.";
                }
                alert(errorMessage);
                showError(errorMessage);
            }
        });
    }
    
    // Texto botón Añadir
    function updateAddButtonText() {
        const entityName = getEntityName(currentEntity);
        $('#btnAddEntity').html(`<i class="bi bi-plus-circle"></i> Añadir ${entityName}`);
    }

    // Cargar tabla de protestos vista principal
    function loadProtestos() {
        UtilidadesUI.mostrarCargandoTabla('#protestosTableBody', 12, 'Cargando protestos...');
        $.get('/protesto', protestos => {
            entityData = protestos || [];
            if (window.Filtrado && typeof Filtrado.renderProtestos === 'function') {
                Filtrado.renderProtestos(protestos);
            } else {
                $('#protestosTableBody').empty();
            }
        }).fail(function() {
            UtilidadesUI.mostrarErrorTabla('#protestosTableBody', 12, 'Error al cargar protestos.', { onRetry: loadProtestos });
        });
    }

    function formatDate(date) {
        return (window.CommonUtils ? CommonUtils.fechas.format(date) : '');
    }

    // Eliminar protesto 
    function deleteProtesto(protestoId) {
        if (!confirm('¿Está seguro de que desea eliminar este protesto? Esta acción eliminará también sus letras y endosos.')) return;
        $.ajax({
            url: `/protesto/${protestoId}`,
            method: 'DELETE',
            success: function(result) {
                if (result.success) {
                    loadProtestos();
                } else {
                    alert('Error al eliminar el protesto');
                }
            },
            error: function(err) {
                console.error('Error al eliminar:', err);
                alert('Error al eliminar el protesto');
            }
        });
    }

    // Editar protesto desde la tabla principal
    function editProtesto(protestoId) {
        currentEntity = 'protestos';
        const protesto = entityData.find(p => p.id_protesto === protestoId);
        if (!protesto) return showError('No se pudo encontrar el protesto para editar');
        
        const protestoData = {
            id_protesto: protesto.id_protesto,
            fecha_protesto: protesto.fecha_protesto,
            archivo: protesto.archivo || '',
            protocolo: protesto.protocolo || '',
            pagina: protesto.pagina || '',
            id_ciudad: protesto.id_ciudad || '',
            id_tipo_letra: protesto.id_tipo_letra || '',
            id_tipo_protesto: protesto.id_tipo_protesto || '',
            motivo: protesto.motivo || '',
            introduccion: protesto.introduccion || '',
            fuente: protesto.fuente || '',
            importe: protesto.importe || '',
            id_moneda: protesto.id_moneda || ''
        };
        
        showEditForm(protestoData);
        $('#protestosTableContainer').hide();
        $('#entityTableContainer').show();
    }

    window.Consultar = {
        editProtesto,
        deleteProtesto,
        loadProtestos
    };
});

