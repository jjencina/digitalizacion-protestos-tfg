class FiltrosAnalisis {
  constructor() {
    this.filtros = {};
    this.entityConfig = {};
    this.currentData = [];
    this.callbacks = {
      onFilterChange: null
    };
  }

  iniciarFiltros(entityConfig, data, entityType) {
    this.entityConfig = entityConfig;
    this.currentData = data;
    this.currentEntityType = entityType;
    
    // Generar filtros según la entidad
    this.generateFilterUI(entityConfig[entityType], data);
    this.loadFilterOptions(entityConfig[entityType], data);
    this.bindFilterEvents();
  }

  // Interfaz de filtros
  generateFilterUI(config, data) {
    const filterContainer = $('#dynamicFilters');
    filterContainer.empty();

    let filtersHTML = '';

    // Filtro de fechas (si la entidad tiene campo de fecha)
    if (config.dateField) {
      filtersHTML += `
        <div class="mb-3">
          <label for="dateRangePicker" class="form-label">
            Rango de fechas
          </label>
          <input
            type="text"
            class="form-control"
            id="dateRangePicker"
            placeholder="DD/MM/AAAA - DD/MM/AAAA"
            inputmode="numeric"
            autocomplete="off"
          >
        </div>
      `;
    }

    // Filtro de importes/valores (si la entidad tiene campo numérico)
    if (config.numberField) {
      const values = data.map(item => parseFloat(item[config.numberField])).filter(v => !isNaN(v));
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      filtersHTML += `
        <div class="mb-3">
          <label class="form-label">
            ${this.getFieldDisplayName(config.numberField)}
          </label>
          <div class="row g-2">
            <div class="col-6">
              <input type="number" class="form-control form-control-sm" id="importeMin" 
                     placeholder="Mínimo" min="${minValue}" max="${maxValue}" step="0.01">
            </div>
            <div class="col-6">
              <input type="number" class="form-control form-control-sm" id="importeMax" 
                     placeholder="Máximo" min="${minValue}" max="${maxValue}" step="0.01">
            </div>
          </div>
        </div>
      `;
    }

    // Filtros por categorías (monedas, ciudades, tipos, etc.)
    const categoryFilters = this.generateCategoryFilters(config, data);
    filtersHTML += categoryFilters;

    // Filtro de texto general
    filtersHTML += `
      <div class="mb-3">
        <label for="textFilter" class="form-label">
          Buscar
        </label>
        <input type="text" class="form-control" id="textFilter" placeholder="">
      </div>
    `;

    // Controles de filtros
    filtersHTML += `
      <div class="d-grid gap-2">
        <button type="button" class="btn btn-primary" id="applyFilters">
          <i class="bi bi-funnel"></i> Aplicar Filtros
        </button>
        <button type="button" class="btn btn-outline-secondary" id="resetFilters">
          <i class="bi bi-arrow-counterclockwise"></i> Limpiar Filtros
        </button> 
      </div>
      
      
      
      <!-- Indicador de filtros activos -->
      <div class="mt-3" id="activeFiltersIndicator"></div>
    `;

    filterContainer.html(filtersHTML);
  }

  // Generar filtros por categorías
  generateCategoryFilters(config, data) {
    let html = '';
    const categoriesProcessed = new Set();

    // Monedas
    if (data.some(item => item.moneda_nombre)) {
      const monedas = [...new Set(data.map(item => item.moneda_nombre).filter(Boolean))];
      html += this.createMultiSelectFilter('monedas', 'Monedas', monedas, 'none');
    }

    // Ciudades
    if (config.locationField || data.some(item => item.ciudad_nombre)) {
      const ciudades = [...new Set(data.map(item => item.ciudad_nombre || item[config.locationField]).filter(Boolean))];
      html += this.createMultiSelectFilter('ciudades', 'Ciudades', ciudades, 'none');
    }

    // Campos de categoría específicos de la entidad
    config.categoryFields.forEach(field => {
      if (!categoriesProcessed.has(field)) {
        const values = [...new Set(data.map(item => item[field]).filter(Boolean))];
        if (values.length > 0) {
          const displayName = this.getFieldDisplayName(field);
          const fieldKey = this.getFieldKey(field);
          html += this.createMultiSelectFilter(fieldKey, displayName, values, 'none');
          categoriesProcessed.add(field);
        }
      }
    });

    // Personas (si existen datos relacionados)
    if (data.some(item => item.personas && item.personas.length > 0)) {
      const personas = new Set();
      data.forEach(item => {
        if (item.personas) {
          item.personas.forEach(persona => {
            personas.add(`${persona.nombre} ${persona.apellidos}`.trim());
          });
        }
      });
      if (personas.size > 0) {
        html += this.createMultiSelectFilter('personas', 'Personas', Array.from(personas), 'bi-person');
      }
    }

    return html;
  }

  // Crear filtro multi-select
  createMultiSelectFilter(key, title, options, icon = 'bi-filter') {
    const selectId = `filter_${key}`;
    
    return `
      <div class="mb-3">
        <label for="${selectId}" class="form-label">
          <i class="${icon}"></i> ${title}
        </label>
        <select class="form-select" id="${selectId}" multiple size="4" data-filter-key="${key}">
          ${options.map(option => `<option value="${option}">${option}</option>`).join('')}
        </select>
        <div class="mt-1">
          <button type="button" class="btn btn-outline-primary btn-sm select-all" data-target="${selectId}">
            Todas
          </button>
          <button type="button" class="btn btn-outline-secondary btn-sm select-none" data-target="${selectId}">
            Ninguna
          </button>
        </div>
      </div>
    `;
  }

  // Cargar opciones de filtros existentes (mejorado)
  loadFilterOptions(config, data) {
    // Inicializar daterangepicker si existe el campo
    if (config.dateField && $('#dateRangePicker').length) {
      this.initDateRangePicker();
    }

    // Configurar filtros numéricos con sliders si hay muchos datos
    if (config.numberField && data.length > 50) {
      this.initRangeSlider(config, data);
    }
  }

  // Inicializar selector de fechas
  initDateRangePicker() {
    if (!$('#dateRangePicker').data('daterangepicker')) {
      $('#dateRangePicker').daterangepicker({
        locale: {
          format: 'DD/MM/YYYY',
          separator: ' - ',
          applyLabel: 'Aplicar',
          cancelLabel: 'Cancelar',
          fromLabel: 'Desde',
          toLabel: 'Hasta',
          daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
          monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          firstDay: 1
        },
        autoUpdateInput: false
      });

      $('#dateRangePicker').on('apply.daterangepicker', (ev, picker) => {
        $(ev.target).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        this.updateActiveFiltersIndicator();
      });

      $('#dateRangePicker').on('cancel.daterangepicker', (ev, picker) => {
        $(ev.target).val('');
        this.updateActiveFiltersIndicator();
      });
    }
  }

  // Inicializar slider de rango para campos numéricos
  initRangeSlider(config, data) {
    if (typeof noUiSlider !== 'undefined' && config.numberField) {
      const values = data.map(item => parseFloat(item[config.numberField])).filter(v => !isNaN(v));
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      // Crear contenedor para slider
      const sliderId = 'rangeSlider_' + config.numberField;
      $('#importeMin').parent().parent().after(`
        <div class="mb-3">
          <label class="form-label">Deslizador de ${this.getFieldDisplayName(config.numberField)}</label>
          <div id="${sliderId}" class="mt-2 mb-2"></div>
          <div class="d-flex justify-content-between">
            <small class="text-muted">${this.formatNumber(minValue)}</small>
            <small class="text-muted">${this.formatNumber(maxValue)}</small>
          </div>
        </div>
      `);
    }
  }

  // Vincular eventos de filtros
  bindFilterEvents() {
    // Aplicar filtros
    $('#applyFilters').off('click').on('click', () => {
      this.applyFilters();
    });

    // Resetear filtros
    $('#resetFilters').off('click').on('click', () => {
      this.resetFilters();
    });

    // Toggle filtros avanzados
    $('#toggleAdvancedFilters').off('click').on('click', () => {
      $('#advancedFiltersPanel').collapse('toggle');
    });

    // Seleccionar todas/ninguna para multi-selects
    $('.select-all').off('click').on('click', (e) => {
      const target = $(e.target).data('target');
      $(`#${target} option`).prop('selected', true);
      this.updateActiveFiltersIndicator();
    });

    $('.select-none').off('click').on('click', (e) => {
      const target = $(e.target).data('target');
      $(`#${target} option`).prop('selected', false);
      this.updateActiveFiltersIndicator();
    });

    // Filtro de texto en tiempo real
    $('#textFilter').off('input').on('input', (e) => {
      clearTimeout(this.textFilterTimeout);
      this.textFilterTimeout = setTimeout(() => {
        this.applyFilters();
      }, 500);
    });

    // Actualizar indicador cuando cambian los multi-selects
    $('[data-filter-key]').off('change').on('change', () => {
      this.updateActiveFiltersIndicator();
    });

    // Cambios en campos numéricos
    $('#importeMin, #importeMax').off('input').on('input', () => {
      this.updateActiveFiltersIndicator();
    });
  }

  // Aplicar todos los filtros
  applyFilters() {
    const filtros = this.getActiveFilters();
    let filteredData = [...this.currentData];

    // Aplicar filtro de fechas
    filteredData = this.applyDateFilter(filteredData, filtros);
    // importes
    filteredData = this.applyAmountFilter(filteredData, filtros);
    // categorías
    filteredData = this.applyCategoryFilters(filteredData, filtros);
    // Texto
    filteredData = this.applyTextFilter(filteredData, filtros);

    // Actualizar indicador de filtros activos
    this.updateActiveFiltersIndicator();

    if (this.callbacks.onFilterChange) {
      this.callbacks.onFilterChange(filteredData);
    }

    return filteredData;
  }

  // Filtro de fechas
  applyDateFilter(data, filtros) {
    if (!filtros.dateRange || !this.entityConfig[this.currentEntityType].dateField) {
      return data;
    }

    const [startDate, endDate] = filtros.dateRange.split(' - ');
    if (!startDate || !endDate) return data;

    const start = moment(startDate, 'DD/MM/YYYY').startOf('day');
    const end = moment(endDate, 'DD/MM/YYYY').endOf('day');
    const dateField = this.entityConfig[this.currentEntityType].dateField;

    return data.filter(item => {
      if (!item[dateField]) return false;
      const itemDate = moment(item[dateField]);
      return itemDate.isBetween(start, end, 'day', '[]');
    });
  }

  // Filtro de importes
  applyAmountFilter(data, filtros) {
    const config = this.entityConfig[this.currentEntityType];
    if (!config.numberField) return data;

    const min = filtros.importeMin ? parseFloat(filtros.importeMin) : -Infinity;
    const max = filtros.importeMax ? parseFloat(filtros.importeMax) : Infinity;

    if (min === -Infinity && max === Infinity) return data;

    return data.filter(item => {
      const value = parseFloat(item[config.numberField]);
      if (isNaN(value)) return false;
      return value >= min && value <= max;
    });
  }

  // Filtros de categorías
  applyCategoryFilters(data, filtros) {
    let filteredData = data;

    // Filtrar por cada categoría seleccionada
    Object.keys(filtros).forEach(key => {
      if (key.startsWith('filter_') && filtros[key].length > 0) {
        const field = this.getFieldFromKey(key);
        filteredData = filteredData.filter(item => {
          const itemValue = item[field] || item[this.mapFieldName(field)];
          return itemValue && filtros[key].includes(itemValue);
        });
      }
    });

    return filteredData;
  }

  // Filtro de texto (buscador escrito por el usuario)
  applyTextFilter(data, filtros) {
    if (!filtros.textFilter) return data;

    const searchTerm = filtros.textFilter.toLowerCase();
    const config = this.entityConfig[this.currentEntityType];

    return data.filter(item => {
      return config.tableFields.some(field => {
        const value = item[field.field];
        return value && value.toString().toLowerCase().includes(searchTerm);
      });
    });
  }

  // Obtener filtros activos
  getActiveFilters() {
    const filtros = {
      dateRange: $('#dateRangePicker').val(),
      importeMin: $('#importeMin').val(),
      importeMax: $('#importeMax').val(),
      textFilter: $('#textFilter').val()
    };

    // Obtener valores de multi-selects
    $('[data-filter-key]').each((index, element) => {
      const key = $(element).data('filter-key');
      filtros[`filter_${key}`] = $(element).val() || [];
    });

    return filtros;
  }

  // Actualizar indicador filtros activos
  updateActiveFiltersIndicator() {
    const filtros = this.getActiveFilters();
    const activeFilters = [];

    if (filtros.dateRange) {
      activeFilters.push(`Fechas: ${filtros.dateRange}`);
    }

    if (filtros.importeMin || filtros.importeMax) {
      const min = filtros.importeMin || 'Sin límite';
      const max = filtros.importeMax || 'Sin límite';
      activeFilters.push(`Importe: ${min} - ${max}`);
    }

    if (filtros.textFilter) {
      activeFilters.push(`Texto: "${filtros.textFilter}"`);
    }

    // Filtros de categorías
    Object.keys(filtros).forEach(key => {
      if (key.startsWith('filter_') && filtros[key].length > 0) {
        const categoryName = key.replace('filter_', '').charAt(0).toUpperCase() + key.replace('filter_', '').slice(1);
        activeFilters.push(`${categoryName}: ${filtros[key].length} seleccionado(s)`);
      }
    });

    const indicator = $('#activeFiltersIndicator');
    if (activeFilters.length > 0) {
      indicator.html(`
        <div class="alert alert-info">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <strong><i class="bi bi-funnel-fill"></i> Filtros Activos (${activeFilters.length}):</strong>
              <ul class="mb-0 mt-1">
                ${activeFilters.map(filter => `<li>${filter}</li>`).join('')}
              </ul>
            </div>
            <button type="button" class="btn btn-sm btn-outline-secondary" id="quickClearFilters">
              <i class="bi bi-x"></i> Limpiar
            </button>
          </div>
        </div>
      `);

      $('#quickClearFilters').off('click').on('click', () => {
        this.resetFilters();
      });
    } else {
      indicator.empty();
    }
  }

  // Resetear todos los filtros
  resetFilters() {
    $('#dateRangePicker').val('');
    $('#importeMin, #importeMax, #textFilter').val('');
    $('[data-filter-key]').val([]);
    this.updateActiveFiltersIndicator();
    
    // Aplicar filtros vacíos
    if (this.callbacks.onFilterChange) {
      this.callbacks.onFilterChange([...this.currentData]);
    }
  }

  // Establecer callback para cambios de filtro
  setFilterChangeCallback(callback) {
    this.callbacks.onFilterChange = callback;
  }

  getFieldDisplayName(field) {
    const displayNames = {
      fecha_protesto: 'Fecha de Protesto',
      fecha_letra: 'Fecha de Letra',
      fecha_endoso: 'Fecha de Endoso',
      importe: 'Importe',
      valor: 'Valor',
      moneda_nombre: 'Moneda',
      ciudad_nombre: 'Ciudad',
      tipo_protesto_nombre: 'Tipo de Protesto',
      tipo_letra_nombre: 'Tipo de Letra',
      tipo_letra_protesto_nombre: 'Tipo de Letra (Protesto)',
      tipo_negociacion_nombre: 'Tipo de Negociación',
      tipo_valor_nombre: 'Valor',
      tipo_entidad: 'Entidad'
    };
    return displayNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getFieldKey(field) {
    const keyMap = {
      moneda_nombre: 'monedas',
      ciudad_nombre: 'ciudades',
      tipo_protesto_nombre: 'tipos_protesto',
      tipo_letra_nombre: 'tipos_letra',
      tipo_letra_protesto_nombre: 'tipos_letra_protesto',
      tipo_negociacion_nombre: 'tipos_negociacion',
      tipo_valor_nombre: 'tipos_valor'
    };
    return keyMap[field] || field.replace(/_nombre$/, 's').replace(/_/g, '_');
  }

  getFieldFromKey(key) {
    const fieldMap = {
      filter_monedas: 'moneda_nombre',
      filter_ciudades: 'ciudad_nombre',
      filter_tipos_protesto: 'tipo_protesto_nombre',
      filter_tipos_letra: 'tipo_letra_nombre',
      filter_tipos_letra_protesto: 'tipo_letra_protesto_nombre',
      filter_tipos_negociacion: 'tipo_negociacion_nombre',
      filter_tipos_valor: 'tipo_valor_nombre',
      filter_tipo_entidad: 'tipo_entidad'
    };
    return fieldMap[key] || key.replace('filter_', '').replace('s_', '_') + '_nombre';
  }

  mapFieldName(field) {
    const mapping = {
      tipos_letra: 'tipo_letra_nombre',
      tipos_protesto: 'tipo_protesto_nombre',
      monedas: 'moneda_nombre',
      ciudades: 'ciudad_nombre'
    };
    return mapping[field] || field;
  }

  formatNumber(number) {
    return new Intl.NumberFormat('es-ES').format(number);
  }
}