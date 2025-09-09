$(document).ready(function() {
  let filteredData = [];
  let currentEntityType = 'todos';
  const itemsPerPage = 20;
  let currentVisualization = 'timeline';
  let lastMapMetric = 'count';
  // Control de gráficos Chart.js
  const chartInstances = {
    mainChart: null
  };

  // Módulos (graficos(chart.js), tabla(javascript base), mapaMundi(Leatlet) y exportacion)
  const filtros = new FiltrosAnalisis();
  const exportacion = new ExportacionAnalisis();
  const mapaMundi = new MapaMundi();
  const tabla = new TablaAnalisis({ itemsPerPage });

  // Configuración de todas las entidades 
  const entityConfig = window.AnalisisConfig;


  $('#entitySelect').val(currentEntityType);
  initEventListeners();
  loadData(currentEntityType);

  // Conectar todos los eventos de la interfaz
  function initEventListeners() {
    // Cambiar entre protestos, letras, endosos....
    $('#entitySelect').on('change', function() {
      currentEntityType = $(this).val();
      loadData(currentEntityType);
    });

    // Cambiar entre visualizaciones
    $('.nav-link[data-chart]').on('click', function(e) {
      e.preventDefault();
      $('.nav-link[data-chart]').removeClass('active');
      $(this).addClass('active');
      currentVisualization = $(this).data('chart');
      updateVisualization(currentVisualization);
    });

    $('#mapMetricSelect').on('change', function() {
      lastMapMetric = $(this).val();
      if (currentVisualization === 'mapamundi') {
        // render con el módulo
        mapaMundi.render('#mainChart', filteredData, entityConfig[currentEntityType], { metric: lastMapMetric });
      }
    });

    $('#refreshMapBtn').on('click', function() {
      if (currentVisualization === 'mapamundi') {
        mapaMundi.render('#mainChart', filteredData, entityConfig[currentEntityType], { metric: lastMapMetric });
      }
    });

    // Control para alternar conexiones
    $('#toggleConnectionsBtn').on('click', function() {
        const btn = $(this);
        if (btn.text().includes('Mostrar')) {
            btn.html('<i class="bi bi-eye-slash"></i> Ocultar Conexiones');
            btn.removeClass('btn-outline-info').addClass('btn-info');
        } else {
            btn.html('<i class="bi bi-share"></i> Mostrar Conexiones');
            btn.removeClass('btn-info').addClass('btn-outline-info');
        }
    });
    $('#exportSQL').on('click', () => exportacion.exportToSQL());
  }

  // Obtener datos del servidor para la entidad seleccionada
  function loadData(entityType) {
    const config = entityConfig[entityType];
    if (!config) return;

    showLoadingState();

    if (entityType === 'todos') {
      $.when(
        $.get(entityConfig.protestos.endpoint),
        $.get(entityConfig.letras.endpoint),
        $.get(entityConfig.endosos.endpoint)
      )
        .done(function (protestosResp, letrasResp, endososResp) {
          const protestos = protestosResp[0] || [];
          const letras = letrasResp[0] || [];
          const endosos = endososResp[0] || [];

          const combined = [];
          const letrasIncluidas = new Set();

          // Protestos
          protestos.forEach(p => {
            combined.push({
              tipo_entidad: 'Protesto',
              id: p.id_protesto,
              fecha: p.fecha_protesto,
              importe: p.importe || 0,
              moneda_nombre: p.moneda_nombre || p.nombre_moneda || '',
              ciudad_nombre: p.ciudad_nombre || p.nombre_ciudad || '',
              tipo_protesto_nombre: p.tipo_protesto_nombre || '',
              tipo_letra_nombre: p.tipo_letra_protesto_nombre || '',
              tipo_valor_nombre: '',
              tipo_detalle: p.tipo_protesto_nombre || p.tipo_letra_protesto_nombre || '',
              roles_count: Array.isArray(p.roles) ? p.roles.length : 0,
              relaciones_count: Array.isArray(p.letras) ? p.letras.length : 0,
              roles: p.roles || [],
              letras: p.letras || []
            });

            // Letras anidadas en protestos
            if (Array.isArray(p.letras)) {
              p.letras.forEach(l => {
                const rolesArr = l.roles || l.roles_letra || [];
                const endososArr = l.endosos || l.letra_endosos || [];
                const valorStr = l.tipo_valor_nombre || l.valor || l.nombre_valor || l.tipo_valor || '';

                combined.push({
                  tipo_entidad: 'Letra',
                  id: l.id_letra,
                  fecha: l.fecha_letra,
                  importe: l.importe || 0,
                  moneda_nombre: l.moneda_nombre || l.nombre_moneda || l.moneda || '',
                  ciudad_nombre: l.ciudad_nombre || l.nombre_ciudad || l.ciudad || '',
                  tipo_letra_nombre: l.tipo_letra_nombre || '',
                  tipo_valor_nombre: valorStr,
                  tipo_detalle: l.tipo_letra_nombre || valorStr || '',
                  roles_count: Array.isArray(rolesArr) ? rolesArr.length : 0,
                  relaciones_count: Array.isArray(endososArr) ? endososArr.length : 0,
                  roles: rolesArr,
                  endosos: endososArr,
                  fecha_vencimiento: l.fecha_vencimiento
                });
                letrasIncluidas.add(l.id_letra);
              });
            }
          });

          // Letras sueltas
          letras.forEach(l => {
            if (!letrasIncluidas.has(l.id_letra)) {
              const rolesArr = l.roles || l.roles_letra || [];
              const endososArr = l.endosos || l.letra_endosos || [];
              const valorStr = l.tipo_valor_nombre || l.valor || l.nombre_valor || l.tipo_valor || '';

              combined.push({
                tipo_entidad: 'Letra',
                id: l.id_letra,
                fecha: l.fecha_letra,
                importe: l.importe || 0,
                moneda_nombre: l.moneda_nombre || l.nombre_moneda || l.moneda || '',
                ciudad_nombre: l.ciudad_nombre || l.nombre_ciudad || l.ciudad || '',
                tipo_letra_nombre: l.tipo_letra_nombre || '',
                tipo_valor_nombre: valorStr,
                tipo_detalle: l.tipo_letra_nombre || valorStr || '',
                roles_count: Array.isArray(rolesArr) ? rolesArr.length : (typeof l.roles_count === 'number' ? l.roles_count : 0),
                relaciones_count: Array.isArray(endososArr) ? endososArr.length : (typeof l.endosos_count === 'number' ? l.endosos_count : 0),
                roles: rolesArr,
                endosos: endososArr,
                fecha_vencimiento: l.fecha_vencimiento
              });
            }
          });

          // Endosos
          endosos.forEach(e => {
            const rolesArr = e.roles || [];
            combined.push({
              tipo_entidad: 'Endoso',
              id: e.id_endoso,
              fecha: e.fecha_endoso,
              importe: e.valor || 0, 
              moneda_nombre: e.moneda_nombre || e.nombre_moneda || e.moneda || '',
              ciudad_nombre: e.ciudad_nombre || e.nombre_ciudad || e.ciudad || '',
              tipo_negociacion_nombre: e.tipo_negociacion_nombre || '',
              tipo_detalle: e.tipo_negociacion_nombre || '',
              roles_count: typeof e.roles_count === 'number' ? e.roles_count : (Array.isArray(rolesArr) ? rolesArr.length : 0),
              relaciones_count: typeof e.relaciones_count === 'number' ? e.relaciones_count : 0,
              roles: rolesArr
            });
          });

          currentData = combined;
          filteredData = [...combined];

          // Inicializar filtros
          filtros.setFilterChangeCallback((filtered) => {
            filteredData = filtered;
            exportacion.updateData(filteredData, entityType);
            updateVisualization(currentVisualization);
          });

          filtros.iniciarFiltros(entityConfig, combined, entityType);
          exportacion.initExportacion(entityConfig, combined, entityType);

          // Activar primera visualización
          $('.nav-link[data-chart]').removeClass('active');
          $('.nav-link[data-chart]:first').addClass('active');
          currentVisualization = $('.nav-link[data-chart]:first').data('chart') || 'timeline';

          updateVisualization(currentVisualization);
        })
        .fail(function (error) {
          console.error('Error cargando datos para "Todos":', error);
          showErrorState('Error al cargar datos combinados (Protestos y Letras).');
        });

      return;
    }

    // Entidades individuales
    $.get(config.endpoint).done(function(data) {
      // Normalización para letras
      if (entityType === 'letras') {
        data = (data || []).map(l => ({
          ...l,
          moneda_nombre: l.moneda_nombre || l.nombre_moneda || l.moneda || '',
          ciudad_nombre: l.ciudad_nombre || l.nombre_ciudad || l.ciudad || '',
          tipo_valor_nombre: l.tipo_valor_nombre || l.valor || l.nombre_valor || l.tipo_valor || ''
        }));
      }

      currentData = data;
      filteredData = [...data];
      
      // Configurar filtros para actualizar datos
      filtros.setFilterChangeCallback((filtered) => {
        filteredData = filtered;
        exportacion.updateData(filteredData, entityType);
        updateVisualization(currentVisualization);
      });

      // Inicializar filtros con nuevos datos
      filtros.iniciarFiltros(entityConfig, data, entityType);
      
      // Configurar exportación
      exportacion.initExportacion(entityConfig, data, entityType);
      
      // Activar primera visualización default
      $('.nav-link[data-chart]').removeClass('active');
      $('.nav-link[data-chart]:first').addClass('active');
      currentVisualization = $('.nav-link[data-chart]:first').data('chart') || 'timeline';
      
      // Generar visualización inicial
      updateVisualization(currentVisualization);
      
    }).fail(function(error) {
      console.error('Error cargando datos:', error);
      showErrorState(`Error al cargar datos de ${config.title}: ${error.statusText || 'Error desconocido'}`);
    });
  }

  // Manejar las visualizaciones
  function updateVisualization(visualizationType) {
    const config = entityConfig[currentEntityType];
    if (!config) return;

    if (chartInstances.mainChart) { chartInstances.mainChart.destroy(); }

    if (visualizationType === 'tabla') {
      $('#mainChart').hide();
      $('#tableContainer').show();
      $('#mapControls').hide();
      $('#mapLegend').hide();

      tabla.setConfig(config);
      tabla.setData(filteredData);
    } else {
      $('#mainChart').show();
      $('#tableContainer').hide();
      if (visualizationType === 'mapamundi') { $('#mapControls').show(); $('#mapLegend').show(); }
      else { $('#mapControls').hide(); $('#mapLegend').hide(); }
      updateCharts(visualizationType);
    }

    $('#dashboardTitle').text(getVisualizationTitle(visualizationType));
  }
  
  // Cambiar gráfico según selección del usuario 
  function updateCharts(chartType) {
    const config = entityConfig[currentEntityType];
    if (!config) return;

    if (chartInstances.mainChart && typeof chartInstances.mainChart.destroy === 'function') {
      chartInstances.mainChart.destroy();
      chartInstances.mainChart = null;
    }

    switch (chartType) {
      case 'timeline':
        chartInstances.mainChart = ChartViews.renderTimeline('#mainChart', filteredData, config);
        break;
      case 'monedas':
        chartInstances.mainChart = ChartViews.renderCurrency('#mainChart', filteredData, config);
        break;
      case 'ciudades':
        chartInstances.mainChart = ChartViews.renderLocation('#mainChart', filteredData, config);
        break;
      case 'mapamundi':
        mapaMundi.render('#mainChart', filteredData, config, { metric: lastMapMetric });
        break;
      case 'importes':
        chartInstances.mainChart = ChartViews.renderAmount('#mainChart', filteredData, config);
        break;
      case 'network':
        NetworkGraph.render('#mainChart', filteredData, config);
        chartInstances.mainChart = null;
        break;
      default:
        chartInstances.mainChart = ChartViews.renderTimeline('#mainChart', filteredData, config);
    }
  }

  // Títulos para cada tipo de visualización
  function getVisualizationTitle(visualizationType) {
    const titles = {
      timeline: 'Evolución temporal',
      monedas: 'Distribución por monedas',
      ciudades: 'Distribución geográfica',
      mapamundi: 'Mapamundi Interactivo',
      importes: 'Distribución de importes',
      network: 'Red de relaciones',
      tabla: 'Vista de Tabla'
    };
    
    return titles[visualizationType] || 'Análisis de datos';
  }

  // Mostrar spinner de carga
  function showLoadingState() {
    UtilidadesUI.mostrarCargandoEn('#mainChart', 'Cargando datos...');
    const cols = (entityConfig[currentEntityType]?.tableFields?.length) || 10;
    UtilidadesUI.mostrarCargandoTabla('#tableBody', cols, 'Cargando datos...');
  }
  
  // Mostrar mensaje de error
  function showErrorState(message) {
    UtilidadesUI.mostrarErrorEn('#mainChart', message || 'Error cargando datos. Inténtelo de nuevo.', {
      onRetry: () => location.reload()
    });
    const cols = (entityConfig[currentEntityType]?.tableFields?.length) || 10;
    UtilidadesUI.mostrarErrorTabla('#tableBody', cols, message || 'Error cargando datos. Inténtelo de nuevo.', {
      onRetry: () => location.reload()
    });
  }

});
