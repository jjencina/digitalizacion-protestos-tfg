class GraficosAnalisis {
  // limpia contenedor
  limpiarContenedor(selector) {
    const $c = $(selector);
    $c.empty();
    return $c;
  }

  // Formatea números español
  formatearNumero(n) {
    return new Intl.NumberFormat('es-ES').format(n);
  }

  // Línea temporal agrupa por fecha y dibuja una línea
  renderizarLineaTiempo(selector, datos, config) {
    if (!Array.isArray(datos) || !datos.length || !config?.dateField) {
      $(selector).html('<div class="alert alert-info">No hay suficientes datos temporales para mostrar un gráfico</div>');
      return null;
    }

    // Prepara etiquetas (fechas) y valores (conteos)
    const { etiquetas, conteos } = this.procesarDatosTemporales(datos, config.dateField);
    const $c = this.limpiarContenedor(selector);
    const canvas = $('<canvas id="timelineChart"></canvas>');
    $c.append(canvas);

    // Config básica de Chart.js para un grafico de línea temporal
    return new Chart(canvas[0], {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: `${config.title} por fecha`,
          data: conteos,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Fecha' } },
          y: { title: { display: true, text: 'Cantidad' }, beginAtZero: true }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  // Cuenta elementos por año a partir de un campo fecha
  procesarDatosTemporales(datos, campoFecha) {
    const años = {};
    (datos || []).forEach(item => {
      const val = item?.[campoFecha];
      if (!val) return;
      const año = new Date(val).getFullYear();
      años[año] = (años[año] || 0) + 1;
    });
    const etiquetas = Object.keys(años).sort();
    const conteos = etiquetas.map(a => años[a]);
    return { etiquetas, conteos };
  }

  // Tarta peso de cada tipo de moneda sobre la cantidad de registrs que hay
  renderizarMonedas(selector, datos) {
    const agrupado = {};
    (datos || []).forEach(item => {
      const m = item?.moneda_nombre;
      if (!m) return;
      agrupado[m] = (agrupado[m] || 0) + 1;
    });

    const etiquetas = Object.keys(agrupado);
    if (etiquetas.length === 0) {
      $(selector).html('<div class="alert alert-info">No hay suficientes datos de monedas para mostrar un gráfico</div>');
      return null;
    }

    const valores = etiquetas.map(l => agrupado[l]);
    const $c = this.limpiarContenedor(selector);
    const canvas = $('<canvas id="currencyChart"></canvas>');
    $c.append(canvas);

    // Colores
    const colores = etiquetas.map(() => `rgba(${this.aleatorio255()}, ${this.aleatorio255()}, ${this.aleatorio255()}, 0.6)`);

    return new Chart(canvas[0], {
      type: 'pie',
      data: { labels: etiquetas, datasets: [{ data: valores, backgroundColor: colores, hoverOffset: 4 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    });
  }

  // Barras horizontales por ubicación
  renderizarUbicaciones(selector, datos, config) {
    const campo = config?.locationField;
    if (!campo || !Array.isArray(datos) || !datos.length) {
      $(selector).html('<div class="alert alert-info">No hay suficientes datos de ubicación para mostrar un gráfico</div>');
      return null;
    }

    // Cuenta por cada valor de ubicación
    const conteos = {};
    datos.forEach(item => {
      const loc = item?.[campo];
      if (!loc) return;
      conteos[loc] = (conteos[loc] || 0) + 1;
    });

    const etiquetas = Object.keys(conteos).sort();
    if (etiquetas.length === 0) {
      $(selector).html('<div class="alert alert-info">No hay suficientes datos de ubicación para mostrar un gráfico</div>');
      return null;
    }

    const valores = etiquetas.map(l => conteos[l]);
    const $c = this.limpiarContenedor(selector);
    const canvas = $('<canvas id="locationChart"></canvas>');
    $c.append(canvas);

    return new Chart(canvas[0], {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Cantidad',
          data: valores,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, title: { display: true, text: 'Cantidad' } },
          y: { title: { display: true, text: 'Ubicación' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  // Histograma parte el rango en 5 tramos, ver cantidades de dinero mas comunes en una seleccion de documentos
  renderizarImportes(selector, datos, config) {
    const campo = config?.numberField;
    if (!campo) {
      $(selector).html('<div class="alert alert-info">Esta entidad no tiene un campo numérico para analizar</div>');
      return null;
    }

    const valores = (datos || []).map(i => parseFloat(i?.[campo])).filter(v => Number.isFinite(v));
    if (valores.length === 0) {
      $(selector).html('<div class="alert alert-info">No hay suficientes datos numéricos para mostrar un gráfico</div>');
      return null;
    }

    // Calcula rangos y agrupa en cubos
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const rango = Math.max(0, max - min);
    const partes = 5;
    const tamanyo = rango / partes || 1;
    const cubos = Array(partes).fill(0);
    const etiquetas = [];

    for (let i = 0; i < partes; i++) {
      const inf = min + tamanyo * i;
      const sup = min + tamanyo * (i + 1);
      etiquetas.push(`${this.formatearNumero(inf)} - ${this.formatearNumero(sup)}`);
    }

    valores.forEach(v => {
      if (v === max) { cubos[partes - 1]++; return; }
      const idx = Math.floor((v - min) / tamanyo);
      if (idx >= 0 && idx < partes) cubos[idx]++;
    });

    const $c = this.limpiarContenedor(selector);
    const canvas = $('<canvas id="amountChart"></canvas>');
    $c.append(canvas);

    return new Chart(canvas[0], {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Cantidad',
          data: cubos,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Frecuencia' } },
          x: { title: { display: true, text: 'Rango de importes' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  aleatorio255() { return Math.floor(Math.random() * 255); }
}

window.GraficosAnalisis = GraficosAnalisis;
const graficosAnalisis = new GraficosAnalisis();
window.ChartViews = {
  renderTimeline: graficosAnalisis.renderizarLineaTiempo.bind(graficosAnalisis),
  renderCurrency: graficosAnalisis.renderizarMonedas.bind(graficosAnalisis),
  renderLocation: graficosAnalisis.renderizarUbicaciones.bind(graficosAnalisis),
  renderAmount: graficosAnalisis.renderizarImportes.bind(graficosAnalisis)
};