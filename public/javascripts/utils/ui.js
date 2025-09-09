class UtilidadesUI {
  static mostrarCargandoEn(selector, mensaje = 'Cargando datos...') {
    const html = `
      <div class="d-flex justify-content-center align-items-center h-100" style="min-height: 200px">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">/span>
          </div>
          <p class="mt-2 text-muted">${mensaje}</p>
        </div>
      </div>
    `;
    $(selector).html(html);
  }

  static mostrarCargandoTabla(selector, colspan = 10, mensaje = 'Cargando datos...') {
    const html = `
      <tr>
        <td colspan="${colspan}" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visualmente-oculto"></span>
          </div>
          <p class="mt-2 text-muted">${mensaje}</p>
        </td>
      </tr>
    `;
    $(selector).html(html);
  }

  static mostrarErrorEn(selector, mensaje = 'Error cargando datos. Inténtelo de nuevo.', opciones = {}) {
    const { onRetry = null, botonTexto = 'Reintentar' } = opciones;
    const html = `
      <div class="d-flex justify-content-center align-items-center h-100" style="min-height: 200px">
        <div class="text-center text-danger">
          <i class="bi bi-exclamation-triangle fs-1"></i>
          <p class="mt-2">${mensaje}</p>
          <button class="btn btn-outline-danger btn-sm mt-2" id="ui-util-retry-btn">
            <i class="bi bi-arrow-clockwise"></i> ${botonTexto}
          </button>
        </div>
      </div>
    `;
    $(selector).html(html);
    $('#ui-util-retry-btn').off('click').on('click', () => {
      if (typeof onRetry === 'function') onRetry();
      else location.reload();
    });
  }

  static mostrarErrorTabla(selector, colspan = 10, mensaje = 'Error cargando datos. Inténtelo de nuevo.', opciones = {}) {
    const { onRetry = null, botonTexto = 'Reintentar' } = opciones;
    const html = `
      <tr>
        <td colspan="${colspan}" class="text-center py-4">
          <div class="text-danger">
            <i class="bi bi-exclamation-triangle fs-2"></i>
            <p class="mt-2">${mensaje}</p>
            <button class="btn btn-outline-danger btn-sm mt-2" id="ui-util-retry-btn-table">
              <i class="bi bi-arrow-clockwise"></i> ${botonTexto}
            </button>
          </div>
        </td>
      </tr>
    `;
    $(selector).html(html);
    $('#ui-util-retry-btn-table').off('click').on('click', () => {
      if (typeof onRetry === 'function') onRetry();
      else location.reload();
    });
  }

  static mostrarExitoEn(selector, mensaje = 'Acción realizada correctamente') {
    const $cont = $(selector);
    const $alert = $(`
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `);
    $cont.prepend($alert);
    setTimeout(() => { $alert.fadeOut(300, () => $alert.remove()); }, 3000);
  }
}

window.UtilidadesUI = UtilidadesUI;