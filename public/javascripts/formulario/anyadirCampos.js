$(document).ready(function() {
    // Manejar el botón de comentario
    $('#btnAddComentario').on('click', function() {
        const section = $('#addCamposModal').data('section');
        console.log('Botón comentario presionado, sección:', section);

        if (!section) {
            console.error('Sección no definida para añadir comentario');
            return;
        }
        addComentarioField(section);

        $('#addCamposModal').modal('hide');
    });

    // Manejar botón de roles adicionales
    $('#btnAddRoles').on('click', function() {
        const section = $('#addCamposModal').data('section');
        console.log('Botón roles presionado, sección:', section);
        openRolesAdicionalesForSection(section);
        $('#addCamposModal').modal('hide');
    });

    // Cuando se abre el m, odalactualizar el título según la sección
    $('#addCamposModal').on('show.bs.modal', function(event) {
        const button = $(event.relatedTarget);
        const section = button.data('section');
        $(this).data('section', section);
        
        console.log('Modal abierto para sección:', section);
        
        const sectionText = getSectionText(section);
        $('#addCamposModalLabel').text(`Añadir campos adicionales - ${sectionText}`);
    });
});

function addComentarioField(section) {
    console.log('Añadiendo comentario para sección:', section);
    
    let containerId, fieldName, placeholder;
    
    if (section === 'protesto') {
        containerId = 'protestoFieldsContainer';
        fieldName = 'comentario_protesto';
        placeholder = 'Comentario del protesto...';
    } else if (section.startsWith('letra_')) {
        const letraIndex = section.split('_')[1];
        containerId = `letraFieldsContainer_${letraIndex}`;
        fieldName = `letras[${letraIndex}][comentario]`;
        placeholder = 'Comentario de la letra...';
    } else if (section.startsWith('endoso_')) {
        const parts = section.split('_');
        const letraIndex = parts[1];
        const endosoIndex = parts[2];
        containerId = `endosoFieldsContainer_${letraIndex}_${endosoIndex}`;
        fieldName = `letras[${letraIndex}][endosos][${endosoIndex}][comentario]`;
        placeholder = 'Comentario del endoso...';
    }

    if ($(`#comentario_${section}`).length > 0) {
        alert('Ya existe un comentario para esta sección');
        return;
    }

    const comentarioHTML = `
        <div class="mb-3 comentario-field" id="comentario_${section}">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label mb-0">Comentario</label>
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeComentario('${section}')">
                    <i class="bi bi-trash"></i> Quitar
                </button>
            </div>
            <textarea class="form-control" name="${fieldName}" rows="3" placeholder="${placeholder}"></textarea>
        </div>
    `;

    if ($(`#${containerId}`).length) {
        $(`#${containerId}`).append(comentarioHTML);
    } else {
        // Crear contenedor si no existe
        let targetSection;
        if (section === 'protesto') {
            // Card principal con título "Formulario protesto"
            const mainCardBody = $('.card:has(h5:contains("Formulario protesto"))').first().find('.card-body').first();
            targetSection = mainCardBody.length ? mainCardBody : $('#protestoForm .card').first().find('> .card-body');
        } else if (section.startsWith('letra_')) {
            targetSection = $(`#letra_${section.split('_')[1]} .card-body`);
        } else if (section.startsWith('endoso_')) {
            targetSection = $(`#endoso_${section.split('_')[1]}_${section.split('_')[2]} .card-body`);
        }
        
        if (targetSection && targetSection.length) {
            targetSection.append(`<div id="${containerId}">${comentarioHTML}</div>`);
        } else {
            console.error('No se pudo encontrar la sección objetivo para:', section);
        }
    }

    if (typeof configurarOrdenTabulacion === 'function') {
        setTimeout(configurarOrdenTabulacion, 50);
    }
}

function openRolesAdicionalesForSection(section) {
    console.log('Abriendo roles adicionales para sección:', section);
    
    let tipoRol, containerId, namePrefix;
    
    // Determinar configuración según la sección
    if (section === 'protesto') {
        tipoRol = 'protesto';
        containerId = 'protestoRolesContainer';
        namePrefix = 'roles_protesto';
    } else if (section && section.startsWith('letra_')) {
        const letraIndex = section.split('_')[1];
        tipoRol = 'letracambio';
        containerId = `letraRolesContainer_${letraIndex}`;
        namePrefix = `letras[${letraIndex}][roles_adicionales]`;
    } else if (section && section.startsWith('endoso_')) {
        const parts = section.split('_');
        const letraIndex = parts[1];
        const endosoIndex = parts[2];
        tipoRol = 'endoso';
        containerId = `endosoRolesContainer_${letraIndex}_${endosoIndex}`;
        namePrefix = `letras[${letraIndex}][endosos][${endosoIndex}][roles_adicionales]`;
    }

    // Verificar que el contenedor existe, si no crearlo
    if (!$(`#${containerId}`).length) {
        createRolesContainer(section, containerId);
    }

    // Abrir el modal de roles adicionales
    if (typeof openRolesAdicionalesModal === 'function') {
        openRolesAdicionalesModal(tipoRol, containerId, namePrefix);
    } else {
        console.error('La función openRolesAdicionalesModal no está disponible');
        alert('Error: No se puede abrir el modal de roles adicionales');
    }
}

function createRolesContainer(section, containerId) {
    const rolesHTML = `
        <div id="${containerId}" class="row g-2 mt-2 roles-container">
            <!-- Los roles adicionales se añadirán aquí -->
        </div>
    `;

    // Determinar dónde insertar el contenedor
    if (section === 'protesto') {
        // Ya existe en el HTML del protesto
        return;
    } else if (section && section.startsWith('letra_')) {
        const letraIndex = section.split('_')[1];
        const targetContainer = $(`#letra_${letraIndex} .card-body`);
        if (targetContainer.length) {
            targetContainer.append(`
                <div class="mt-3">
                    <h6>Roles adicionales</h6>
                    ${rolesHTML}
                </div>
            `);
        }
    } else if (section && section.startsWith('endoso_')) {
        const parts = section.split('_');
        const letraIndex = parts[1];
        const endosoIndex = parts[2];
        const targetContainer = $(`#endoso_${letraIndex}_${endosoIndex} .card-body`);
        if (targetContainer.length) {
            targetContainer.append(`
                <div class="mt-3">
                    <h6>Roles adicionales</h6>
                    ${rolesHTML}
                </div>
            `);
        }
    }
}

function removeComentario(section) {
    if (confirm('¿Está seguro de que desea quitar el comentario?')) {
        $(`#comentario_${section}`).fadeOut(300, function() {
            $(this).remove();
        });
    }
}

function getSectionText(section) {
    if (section === 'protesto') {
        return 'Protesto';
    } else if (section && section.startsWith('letra_')) {
        const letraIndex = section.split('_')[1];
        return `Letra ${parseInt(letraIndex) + 1}`;
    } else if (section && section.startsWith('endoso_')) {
        const parts = section.split('_');
        const letraIndex = parts[1];
        const endosoIndex = parts[2];
        return `Endoso ${parseInt(endosoIndex) + 1} de Letra ${parseInt(letraIndex) + 1}`;
    }
    return section;
}

window.openRolesAdicionalesForSection = openRolesAdicionalesForSection;
window.getSectionText = getSectionText;
window.removeComentario = removeComentario;