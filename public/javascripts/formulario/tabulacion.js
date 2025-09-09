let arranqueFormulario = true;

$(document).ready(function() {
  configurarNavegacionFormulario();

  // Al cargar, enfocar "Archivo"
  enfocarArchivoAlArrancar();

  // Al terminar de cargar todo, salir del modo de arranque
  $(window).on('load', function() {
    setTimeout(() => { arranqueFormulario = false; }, 500);
  });

  // Vigilar cambios dinámicos para recalcular el orden de tabulación
  const observer = new MutationObserver(() => {
    setTimeout(configurarOrdenTabulacion, 50);
  });
  observer.observe(document.getElementById('protestoForm'), { childList: true, subtree: true });

  // Recalcular al mostrar/ocultar secciones (checkbox)
  $(document).on('change', '#protestoForm input[type="checkbox"]', function() {
    setTimeout(configurarOrdenTabulacion, 50);
  });

  // Eventos de estructura dinámica
  $(document).on('letraAdded', function(event, letraIndex) {
    setTimeout(() => {
      configurarOrdenTabulacion();
      if (arranqueFormulario) return;
      const primero = $(`#letra_${letraIndex} :input:enabled:visible`).first();
      if (primero.length) primero.focus();
    }, 50);
  });

  $(document).on('endosoAdded', function(event, letraIndex, endosoIndex) {
    setTimeout(() => {
      configurarOrdenTabulacion();
      if (arranqueFormulario) return;
      const primero = $(`#endoso_${letraIndex}_${endosoIndex} :input:enabled:visible`).first();
      if (primero.length) primero.focus();
    }, 50);
  });

  // Al añadir roles adicionales desde el modal
  $(document).on('rolAdded', function(event, tipo, containerId) {
    setTimeout(() => {
      configurarOrdenTabulacion();
      const primero = $(`#${containerId} :input:enabled:visible`).first();
      if (primero.length) primero.focus();
    }, 50);
  });

  // Manejo de Enter y flechas para moverse por el formulario y las sugerencias
  $(document).on('keydown', '#protestoForm input, #protestoForm select, #protestoForm textarea, #protestoForm button, #protestoForm a', function(e) {
    if (e.key !== 'Enter' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    const $el = $(this);

    // Navegar por sugerencias con flechas
    if (esCampoDeBusqueda($el) && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const $cont = encontrarContenedorSugerencias($el);
      if ($cont && $cont.is(':visible')) {
        e.preventDefault();
        moverSugerenciaActiva($cont, e.key === 'ArrowDown' ? 1 : -1);
        return;
      }
    }

    // Enter: si hay sugerencias visibles, seleccionar
    if (e.key === 'Enter') {
      const $cont = esCampoDeBusqueda($el) ? encontrarContenedorSugerencias($el) : null;
      if ($cont && $cont.is(':visible')) {
        e.preventDefault();
        seleccionarSugerenciaActivaOPrimera($cont);
        return;
      }

      // Textareas: Shift+Enter inserta salto, Enter avanza
      if ($el.is('textarea')) {
        if (e.shiftKey) return;
        e.preventDefault();
        enfocarSiguientePorTabindex($el);
        return;
      }

      // Checkboxes: alternar y disparar change
      if ($el.is(':checkbox')) {
        e.preventDefault();
        $el.prop('checked', !$el.prop('checked')).change();
        return;
      }

      // Botones/enlaces: simular click
      if ($el.is('button, .btn, a, [role="button"], .list-group-item, .dropdown-item, .add-campos-link')) {
        e.preventDefault();
        $el.trigger('click');
        return;
      }

      // Otros input/select: avanzar
      if ($el.is('input, select')) {
        e.preventDefault();
        enfocarSiguientePorTabindex($el);
        return;
      }
    }
  });

  // Evitar envío accidental con Enter (salvo el submit)
  $('#protestoForm').on('keydown', function(e) {
    if (e.key === 'Enter' && !$(e.target).is('button[type="submit"]')) {
      e.preventDefault();
    }
  });

  // Al abrir cualquier modal, asignar su orden de tabulación
  $('.modal').on('shown.bs.modal', function() {
    configurarOrdenTabulacionModal($(this));
  });
});

// ¿Es un input de búsqueda de entidad?
function esCampoDeBusqueda($el) {
  return $el.is('.persona-search, .ciudad-search, .moneda-search, .tipo-letra-search, .tipo-protesto-search, .tipo-valor-search');
}

// Buscar el contenedor de sugerencias asociado a un input
function encontrarContenedorSugerencias($input) {
  const grupo = $input.closest('.persona-search-group, .ciudad-search-group, .moneda-search-group, .tipo-letra-search-group, .tipo-protesto-search-group, .tipo-valor-search-group');
  if (!grupo.length) return null;
  const cont = grupo.find(
    '.persona-suggestions, .ciudad-suggestions, .moneda-suggestions, .tipo-letra-suggestions, .tipo-protesto-suggestions, .tipo-valor-suggestions'
  ).first();
  return cont.length ? cont : null;
}

// Mover la selección activa en la lista de sugerencias
function moverSugerenciaActiva($container, direccion) {
  const $items = $container.find('.active:visible, .list-group-item:visible, .suggestion:visible, div:visible, li:visible').filter(function() {
    const $it = $(this);
    return $it.is('.persona-suggestion, .ciudad-suggestion, .list-group-item, .suggestion, div, li');
  });

  if (!$items.length) return;

  let idx = $items.index($items.filter('.active'));
  if (idx === -1) idx = (direccion > 0 ? -1 : 0);

  const nextIdx = Math.max(0, Math.min($items.length - 1, idx + direccion));
  $items.removeClass('active');
  const $siguiente = $items.eq(nextIdx).addClass('active');

  const contEl = $container.get(0);
  const sigEl = $siguiente.get(0);
  if (contEl && sigEl) {
    const cTop = contEl.scrollTop;
    const cBottom = cTop + contEl.clientHeight;
    const eTop = sigEl.offsetTop;
    const eBottom = eTop + sigEl.offsetHeight;
    if (eTop < cTop) contEl.scrollTop = eTop;
    else if (eBottom > cBottom) contEl.scrollTop = eBottom - contEl.clientHeight;
  }
}

// Seleccionar la sugerencia activa (o la primera si no hay activa)
function seleccionarSugerenciaActivaOPrimera($container) {
  let $item = $container.find('.active:visible').first();
  if (!$item.length) {
    $item = $container.find('.persona-suggestion:visible, .ciudad-suggestion:visible, .list-group-item:visible, .suggestion:visible, div:visible, li:visible').first();
  }
  if ($item.length) $item.trigger('click');
}

// Enfocar el siguiente elemento según tabindex
function enfocarSiguientePorTabindex($el) {
  const actual = parseInt($el.attr('tabindex'), 10);
  if (isNaN(actual)) {
    configurarOrdenTabulacion();
    const primero = $('#protestoForm [tabindex="1"]').first();
    if (primero.length) primero.focus();
    return;
  }
  const $siguiente = $(`[tabindex="${actual + 1}"]`);
  if ($siguiente.length) $siguiente.first().focus();
}

function configurarNavegacionFormulario() {
  configurarOrdenTabulacion();
}

// Calcula y asigna el orden de tabulación de todo el formulario
function configurarOrdenTabulacion() {
  const $form = $('#protestoForm');

  // Reset de tabindex a incicio
  $form.find('input, select, textarea, button, a').not('[tabindex="-1"]') .attr('tabindex', -1);

  let indiceTab = 1;
  const asignados = new Set();
  const agregarEnOrden = ($elementos) => {
    $elementos
      .filter(':visible')
      .not('[disabled], [readonly], :hidden')
      .each(function() {
        if (!asignados.has(this)) {
          $(this).attr('tabindex', indiceTab++);
          asignados.add(this);
        }
      });
  };

  // 1) Bloque principal del protesto
  agregarEnOrden($('input[name="archivo"]'));
  agregarEnOrden($('.persona-search[data-for="escribano"]'));
  agregarEnOrden($('input[name="protocolo"]'));
  agregarEnOrden($('input[name="pagina"]'));
  agregarEnOrden($('.ciudad-search[data-for="protesto_ciudad"]'));
  agregarEnOrden($('input[name="fecha_protesto"]'));
  agregarEnOrden($('.persona-search[data-for="protestante"]'));
  agregarEnOrden($('.persona-search[data-for="representante"]'));
  agregarEnOrden($('.tipo-letra-search[data-for="tipo_letra_protesto"]'));
  agregarEnOrden($('a[data-bs-target="#addCamposModal"][data-section="protesto"]'));

  // Resto del protesto
  agregarEnOrden($('#protestoRolesContainer').find(':input, a, button'));

  // 2) Letras y endosos
  $('.letra-section').each(function() {
    const letraId = $(this).attr('id');

    // 2.a) Campos de la letra (sin incluir sus endosos)
    agregarEnOrden(
      $(`#${letraId} :input`).filter(function() {
        return $(this).closest('.endoso-section').length === 0;
      })
    );

    // 2.b) Enlace "Añadir más campos" de la letra
    agregarEnOrden(
      $(`#${letraId} a[data-bs-target="#addCamposModal"][data-section^="letra"], #${letraId} a[data-bs-target="#addCamposModal"][data-section="letra"]`)
    );

    // 2.c) Endosos dentro de la letra
    const letraIndex = letraId.split('_')[1];
    $(`#endososContainer_${letraIndex} .endoso-section`).each(function() {
      const endosoId = $(this).attr('id');

      // Campos del endoso
      agregarEnOrden($(`#${endosoId} :input`));

      // Enlace "Añadir más campos" del endoso
      agregarEnOrden(
        $(`#${endosoId} a[data-bs-target="#addCamposModal"][data-section^="endoso"], #${endosoId} a[data-bs-target="#addCamposModal"][data-section="endoso"]`)
      );
    });

    // 2.d) Botón "Añadir Endoso"
    agregarEnOrden($(`#letra_${letraIndex} button[onclick^="addEndoso("]`));
  });

  // 3) Botones "Añadir Letra"
  agregarEnOrden($form.find('button[onclick^="addLetra"]'));

  // 4) Continuación datos protesto
  agregarEnOrden($('textarea[name="motivo_impago"]'));
  agregarEnOrden($('.persona-search[data-for="presentado"]'));
  agregarEnOrden($('.ciudad-search[data-for="presentado_ciudad"]'));
  agregarEnOrden($('input.form-check-input[onchange*="abonoCesion"]'));
  agregarEnOrden($('#abonoCesion').find(':input'));
  agregarEnOrden($('.tipo-protesto-search[data-for="tipo_protesto"]'));

  // 5) Guardar Protesto
  agregarEnOrden($form.find('button[type="submit"]'));

  // 6) Enlaces/botones visibles restantes
  $form.find('a, button')
    .filter(':visible')
    .filter(function() { return $(this).attr('tabindex') == -1; })
    .each(function() { $(this).attr('tabindex', indiceTab++); });
}

// Orden de tabulación dentro de un modal
function configurarOrdenTabulacionModal(modal) {
  let indiceTab = 1;

  modal.find('input, select, textarea, button, a')
    .not('[tabindex="-1"]')
    .attr('tabindex', -1);

  modal.find('input, select, textarea').not('[disabled], [readonly], :hidden').each(function() {
    $(this).attr('tabindex', indiceTab++);
  });

  modal.find('button, a.btn, .list-group-item').not('[disabled], [readonly], :hidden').each(function() {
    $(this).attr('tabindex', indiceTab++);
  });

  setTimeout(function() {
    modal.find('[tabindex="1"]').first().focus();
  }, 150);
}

// Utilidades de notificación (compatibles con otros módulos)
function notificarCambioEstructura() {
  $(document).trigger('formularioActualizado');
}
function notificarLetraAgregada(letraIndex) {
  $(document).trigger('letraAdded', [letraIndex]);
}
function notificarEndosoAgregado(letraIndex, endosoIndex) {
  $(document).trigger('endosoAdded', [letraIndex, endosoIndex]);
}

// Enfoca el campo "Archivo" al arrancar, con reintentos
function enfocarArchivoAlArrancar(reintentos = 12, demora = 150) {
  const intentar = (intento = 0) => {
    const $archivo = $('input[name="archivo"]:visible:enabled').first();
    if ($archivo.length) {
      if (typeof configurarOrdenTabulacion === 'function') configurarOrdenTabulacion();
      setTimeout(() => {
        $archivo.focus();
        if (typeof $archivo[0].select === 'function') $archivo[0].select();
      }, 0);
      return;
    }
    if (intento < reintentos) {
      setTimeout(() => intentar(intento + 1), demora);
    }
  };
  intentar();
}

window.enfocarArchivoAlArrancar = enfocarArchivoAlArrancar;
window.configurarOrdenTabulacion = configurarOrdenTabulacion;
window.configurarOrdenTabulacionModal = configurarOrdenTabulacionModal;
window.notificarCambioEstructura = notificarCambioEstructura;
window.notificarLetraAgregada = notificarLetraAgregada;
window.notificarEndosoAgregado = notificarEndosoAgregado;