let activeFilters = {};

const formatDate = (d) => (window.CommonUtils ? CommonUtils.fechas.format(d) : (d || ''));
const formatNumber = (n) => (window.CommonUtils ? CommonUtils.numeros.format(n) : (n ?? ''));

// Función para cargar los selects de filtros
function loadFilterSelects() {
    // Cargar tipos de protesto
    $.get('/protesto/tipos/protestos', function(data) {
        const options = data.map(item => 
            `<option value="${item.id_tipo_protesto}">${item.nombre}</option>`
        ).join('');
        $('#filtroTipoProtesto').html(options);
    });
    
    // Cargar tipos de letra
    $.get('/letra/tipos/letra', function(data) {
        const options = data.map(item => 
            `<option value="${item.id_tipo_letra}">${item.nombre}</option>`
        ).join('');
        $('#filtroTipoLetra').html(options);
    });
    
    // Cargar ciudades
    $.get('/ciudades', function(data) {
        const options = data.map(item => 
            `<option value="${item.id_ciudad}">${item.nombre_ciudad} (${item.pais})</option>`
        ).join('');
        $('#filtroCiudad').html(options);
    });
    
    // Cargar personas
    $.get('/personas', function(data) {
        const options = data.map(item => 
            `<option value="${item.id_persona}">${item.nombre} ${item.apellidos}</option>`
        ).join('');
        $('#filtroPersona').html(options);
    });
    
    // Cargar roles
    $.get('/roles', function(data) {
        // Filtrar solo roles relacionados con protestos
        const rolesProtesto = data.filter(item => item.tipo === 'protesto');
        const options = rolesProtesto.map(item => 
            `<option value="${item.id_rol}">${item.nombre_rol}</option>`
        ).join('');
        $('#filtroRol').html(options);
    });
    
    // Cargar monedas
    $.get('/monedas', function(data) {
        const options = data.map(item => 
            `<option value="${item.id_moneda}">${item.nombre_moneda} (${item.simbolo})</option>`
        ).join('');
        $('#filtroMoneda').html(options);
    });
    
    // Cargar tipos de negociación
    $.get('/endoso/tipos/negociacion', function(data) {
        const options = data.map(item => 
            `<option value="${item.id_tipo_negociacion}">${item.nombre}</option>`
        ).join('');
        $('#filtroTipoNegociacion').html(options);
    });
}

// Función para cargar protestos filtrados
function loadFilteredProtestos(filters) {
    let queryParams = [];
    
    // Añadir parámetros fecha
    if (filters.fecha && filters.fecha.desde) {
        queryParams.push(`fechaDesde=${filters.fecha.desde}`);
    }
    if (filters.fecha && filters.fecha.hasta) {
        queryParams.push(`fechaHasta=${filters.fecha.hasta}`);
    }
    
    // Añadir tipos de protesto
    if (filters.tipoProtesto && filters.tipoProtesto.length > 0) {
        filters.tipoProtesto.forEach(tipo => {
            queryParams.push(`tipoProtesto=${tipo}`);
        });
    }
    
    // Añadir tipos de letra
    if (filters.tipoLetra && filters.tipoLetra.length > 0) {
        filters.tipoLetra.forEach(tipo => {
            queryParams.push(`tipoLetra=${tipo}`);
        });
    }
    
    // Añadir ciudades
    if (filters.ciudad && filters.ciudad.length > 0) {
        filters.ciudad.forEach(ciudad => {
            queryParams.push(`ciudad=${ciudad}`);
        });
    }
    
    // Añadir personas
    if (filters.persona && filters.persona.length > 0) {
        filters.persona.forEach(persona => {
            queryParams.push(`persona=${persona}`);
        });
    }
    
    // Añadir roles
    if (filters.rol && filters.rol.length > 0) {
        filters.rol.forEach(rol => {
            queryParams.push(`rol=${rol}`);
        });
    }
    
    // Añadir importes
    if (filters.importe && filters.importe.desde) {
        queryParams.push(`importeDesde=${filters.importe.desde}`);
    }
    if (filters.importe && filters.importe.hasta) {
        queryParams.push(`importeHasta=${filters.importe.hasta}`);
    }
    
    // Añadir monedas
    if (filters.moneda && filters.moneda.length > 0) {
        filters.moneda.forEach(moneda => {
            queryParams.push(`moneda=${moneda}`);
        });
    }
    
    // Añadir tipos de negociación
    if (filters.tipoNegociacion && filters.tipoNegociacion.length > 0) {
        filters.tipoNegociacion.forEach(tipo => {
            queryParams.push(`tipoNegociacion=${tipo}`);
        });
    }
    
    // URL
    const url = queryParams.length > 0 ? `/protesto/filtrado?${queryParams.join('&')}` : '/protesto';
    
    // Mostrar carga
    $('#protestosTableBody').html(`
        <tr>
            <td colspan="12" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Aplicando filtros...</p>
            </td>
        </tr>
    `);
    
    // Realizar la petición
    $.get(url, function(protestos) {
        // Si hay filtros activos, mostrar indicador
        if (queryParams.length > 0) {
            // Añadir indicador de filtros activos
            $('.entity-panel').append(`
                <div class="filtros-activos-badge mt-2 alert alert-info">
                    <i class="bi bi-funnel-fill"></i>
                    Filtros activos: ${queryParams.length}
                    <button class="btn btn-sm btn-outline-secondary ms-2" id="btnLimpiarFiltros">
                        Limpiar
                    </button>
                </div>
            `);
            
            // Manejador para limpiar filtros
            $('#btnLimpiarFiltros').on('click', function() {
                activeFilters = {};
                $('.filtros-activos-badge').remove();
                loadProtestos();
            });
        } else {
            // Eliminar indicador si existe
            $('.filtros-activos-badge').remove();
        }
        
        // Mostrar resultados
        renderProtestos(protestos);
    }).fail(function(err) {
        console.error('Error aplicando filtros:', err);
        $('#protestosTableBody').html(`
            <tr>
                <td colspan="12" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Error al aplicar filtros. Por favor, inténtelo de nuevo.
                </td>
            </tr>
        `);
    });
}

// Función para renderizar protestos
function renderProtestos(protestos) {
    const tbody = $('#protestosTableBody');
    tbody.empty();
    
    if (protestos.length === 0) {
        tbody.html(`
            <tr>
                <td colspan="12" class="text-center">
                    No se encontraron protestos que coincidan con los filtros aplicados
                </td>
            </tr>
        `);
        return;
    }
    
    protestos.forEach(p => {
        console.log("Procesando protesto:", {
            id: p.id_protesto,
            ciudad: p.ciudad_nombre,
            letras: p.letras?.map(l => ({
                id: l.id_letra,
                ciudad: l.ciudad_nombre,
                plazo: l.plazo_dias,
                endosos: l.endosos?.map(e => ({
                    id: e.id_endoso,
                    ciudad: e.ciudad_nombre
                }))
            }))
        });
        
        // Fila del protesto 
        const protestoRow = $(`
            <tr class="expandable-row protesto-row" data-protesto-id="${p.id_protesto}">
                <td><i class="bi bi-chevron-right expand-icon"></i></td>
                <td><span class="id-badge">Protesto #${p.id_protesto}</span></td>
                <td>${formatDate(p.fecha_protesto)}</td>
                <td>${p.archivo || ''}</td>
                <td>${p.protocolo || ''}</td>
                <td>${p.pagina || ''}</td>
                <td>${p.ciudad_nombre || ''}</td>
                <td>${p.tipo_letra_protesto_nombre || ''}</td>
                <td>${p.tipo_protesto_nombre || ''}</td>
                <td>${p.motivo || ''}</td>
                <td>
                    <div class="roles-container">
                        ${p.roles.map(r => `
                            <div class="role-badge">
                                ${r.nombre_rol}: ${r.nombre_persona}
                                <span class="location-badge">
                                    <i class="bi bi-geo-alt"></i> ${r.nombre_ciudad || 'Sin ubicación'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </td>
                <td>
                    <button class="btn btn-outline-primary btn-sm btn-edit-protesto" data-protesto-id="${p.id_protesto}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm delete-protesto" data-protesto-id="${p.id_protesto}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);

        tbody.append(protestoRow);

        // Editar
        protestoRow.find('.btn-edit-protesto').on('click', function(e) {
            e.stopPropagation();
            const protestoId = $(this).data('protesto-id');
            if (window.Consultar && typeof window.Consultar.editProtesto === 'function') {
                window.Consultar.editProtesto(protestoId);
            }
        });

        // Borrar
        protestoRow.find('.delete-protesto').on('click', function(e) {
            e.stopPropagation();
            const protestoId = $(this).data('protesto-id');
            if (window.Consultar && typeof window.Consultar.deleteProtesto === 'function') {
                window.Consultar.deleteProtesto(protestoId);
            }
        });

        // Tabla anidada para las letras del protesto
        if (p.letras && p.letras.length > 0) {
            // Crear una fila para contener la tabla anidada
            const letraTableRow = $(`
                <tr class="letra-table-container" data-protesto-id="${p.id_protesto}" style="display: none;">
                    <td colspan="12" class="nested-table-container">
                        <table class="nested-table letra-nested-table">
                            <thead>
                                <tr>
                                    <th style="width: 50px"></th>
                                    <th style="width: 150px">ID</th>
                                    <th style="width: 150px">Fecha</th>
                                    <th style="width: 150px">Vencimiento</th>
                                    <th style="width: 150px">Importe</th>
                                    <th style="width: 150px">Tipo</th>
                                    <th style="width: 150px">Valor</th>
                                    <th style="width: 150px">Plazo</th>
                                    <th style="width: 150px">Ciudad</th>
                                    <th>Roles</th>
                                </tr>
                            </thead>
                            <tbody class="letra-table-body" data-protesto-id="${p.id_protesto}">
                            </tbody>
                        </table>
                    </td>
                </tr>
            `);
            
            tbody.append(letraTableRow);
            
            // Añadir letras a la tabla anidada
            const letraTableBody = letraTableRow.find(`.letra-table-body[data-protesto-id="${p.id_protesto}"]`);
            
            p.letras.forEach(letra => {
                const letraRow = $(`
                    <tr class="letra-nested-row expandable-row" data-letra-id="${letra.id_letra}" data-protesto-id="${p.id_protesto}">
                        <td><i class="bi bi-chevron-right expand-icon"></i></td>
                        <td><span class="id-badge">Letra #${letra.id_letra}</span></td>
                        <td>${formatDate(letra.fecha_letra)}</td>
                        <td>${letra.fecha_vencimiento || ''}</td>
                        <td>${formatNumber(letra.importe)} ${letra.moneda_nombre}</td>
                        <td>${letra.tipo_letra_nombre || ''}</td>
                        <td>${letra.tipo_valor || ''}</td>
                        <td>${letra.tipo_plazo || ''} (${letra.plazo_dias || '0'} días)</td>
                        <td>${letra.ciudad_nombre || ''}</td>
                        <td>
                            <div class="roles-container">
                                ${letra.roles.map(rol => `
                                    <div class="role-badge">
                                        ${rol.nombre_rol}: ${rol.nombre_persona}
                                        <span class="location-badge">
                                            <i class="bi bi-geo-alt"></i> ${rol.nombre_ciudad || 'Sin ubicación'}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        </td>
                    </tr>
                `);
                
                letraTableBody.append(letraRow);
                
                // Si hay endosos, crear tabla anidada para endosos
                if (letra.endosos && letra.endosos.length > 0) {
                    const endosoTableRow = $(`
                        <tr class="endoso-table-container" data-letra-id="${letra.id_letra}" style="display: none;">
                            <td colspan="10" class="nested-table-container">
                                <table class="nested-table endoso-nested-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 50px"></th>
                                            <th style="width: 120px">ID</th>
                                            <th style="width: 120px">Fecha</th>
                                            <th style="width: 120px">Valor</th>
                                            <th style="width: 120px">Tipo</th>
                                            <th style="width: 120px">Ciudad</th>
                                            <th>Roles</th>
                                        </tr>
                                    </thead>
                                    <tbody class="endoso-table-body" data-letra-id="${letra.id_letra}">
                                    </tbody>
                                </table>
                                <div class="text-end p-2">
                                    <small class="text-muted">${letra.endosos.length} endoso(s)</small>
                                </div>
                            </td>
                        </tr>
                    `);
                    
                    letraTableBody.append(endosoTableRow);
                    
                    // Añadir endosos a la tabla anidada
                    const endosoTableBody = endosoTableRow.find(`.endoso-table-body[data-letra-id="${letra.id_letra}"]`);
                    
                    letra.endosos.forEach(endoso => {
                        const endosoRow = $(`
                            <tr class="endoso-nested-row" data-endoso-id="${endoso.id_endoso}">
                                <td><i class="bi bi-dot"></i></td>
                                <td><span class="id-badge">Endoso #${endoso.id_endoso}</span></td>
                                <td>${formatDate(endoso.fecha_endoso)}</td>
                                <td>${formatNumber(endoso.valor)} ${endoso.moneda_nombre || ''}</td>
                                <td>${endoso.tipo_negociacion_nombre || ''}</td>
                                <td>${endoso.ciudad_nombre || ''}</td>
                                <td>
                                    <div class="roles-container">
                                        ${endoso.roles.map(rol => `
                                            <div class="role-badge">
                                                ${rol.nombre_rol}: ${rol.nombre_persona}
                                                <span class="location-badge">
                                                    <i class="bi bi-geo-alt"></i> ${rol.nombre_ciudad || 'Sin ubicación'}
                                                </span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </td>
                            </tr>
                        `);
                        
                        endosoTableBody.append(endosoRow);
                    });
                }
            });
        }
    });
}

window.Filtrado = {
    loadFilterSelects,
    loadFilteredProtestos,
    renderProtestos,
    getActiveFilters: () => activeFilters,
    setActiveFilters: (filters) => { activeFilters = filters; }
};