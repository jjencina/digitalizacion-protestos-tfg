class MapaMundi {
  constructor() {
    this.map = null;
    this.markersLayer = null;
    this.coordsCache = null;
  }

  async render(containerSelector, data, config, options = {}) {
    const container = $(containerSelector);
    container.html('<div id="mapContainer" style="height: 700px;"></div>');

    // Verifica Leaflet.
    if (typeof L === 'undefined') {
      $('#mapContainer').html('<div class="alert alert-warning">Error: Leaflet no está disponible</div>');
      return;
    }

    try {
      // Asegura coordenadas de ciudades (con caché).
      const coords = await this.cityCoords();

      // Reinicia mapa si ya existe.
      this.destroy();

      // Crea mapa centrado en Madrid.
      this.map = L.map('mapContainer', {
        center: [40.4168, -3.7038],
        zoom: 5,
        zoomControl: true,
        attributionControl: true
      });

      // Capa base (mapa satelite Esri)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imagery © Esri'
      }).addTo(this.map);

      // Capa de marcadores
      this.markersLayer = L.layerGroup().addTo(this.map);

      // Agrega y selecciona métrica.
      const metric = options.metric || 'count';
      const aggregated = this.aggregateByCity(data, config);
      const cities = Object.keys(aggregated);

      // Muestra aviso si no hay datos.
      if (cities.length === 0) {
        L.popup()
          .setLatLng([40.4168, -3.7038])
          .setContent('<div class="alert alert-info mb-0">No hay datos para mostrar con los filtros actuales</div>')
          .openOn(this.map);
        return;
      }

      // Calcula escalas por valor máximo.
      const values = cities.map(c => this.getMetricValue(aggregated[c], metric));
      const maxValue = Math.max(...values.map(v => Number(v) || 0), 0);

      // Dibuja círculos por ciudad.
      const markers = [];
      cities.forEach(cityName => {
        const cityStats = aggregated[cityName];
        const coord = coords[cityName];
        const value = this.getMetricValue(cityStats, metric);
        if (!coord || !isFinite(value) || value <= 0) return;

        const radius = this.calculateRadius(value, maxValue);
        const color = this.calculateColor(value, maxValue);

        const marker = L.circleMarker([coord.lat, coord.lng], {
          radius,
          fillColor: color,
          color: '#ffffff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.markersLayer);

        // Contenido del popup.
        const popupHtml = `
          <div class="city-popup">
            <h6><strong>${cityName}</strong></h6>
            <p class="mb-1"><small>${coord.pais || ''}</small></p>
            <hr class="my-2">
            <div class="city-stats">
              <div class="row"><div class="col-7"><small>Documentos:</small></div><div class="col-5"><strong>${cityStats.count}</strong></div></div>
              <div class="row"><div class="col-7"><small>Importe total:</small></div><div class="col-5"><strong>${this.formatCurrencyES(cityStats.importeTotal)}</strong></div></div>
              <div class="row"><div class="col-7"><small>Relaciones:</small></div><div class="col-5"><strong>${cityStats.relacionesTotal}</strong></div></div>
            </div>
          </div>
        `;
        marker.bindPopup(popupHtml);

        // Tooltip con métrica.
        const metricLabel = metric === 'count' ? 'docs' : (metric === 'importe' ? 'importe' : 'relaciones');
        marker.bindTooltip(`${cityName} (${metricLabel}: ${metric === 'importe' ? this.formatCurrencyES(value) : value})`, {
          permanent: false,
          direction: 'top',
          offset: [0, -10]
        });

        markers.push(marker);
      });

      // Ajusta la vista a los marcadores.
      if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
      } else {
        L.popup()
          .setLatLng([40.4168, -3.7038])
          .setContent('<div class="alert alert-info mb-0">No hay ciudades con coordenadas para los datos filtrados</div>')
          .openOn(this.map);
      }
    } catch (err) {
      console.error('Error inicializando el mapamundi:', err);
      $('#mapContainer').html('<div class="alert alert-danger">Error inicializando el mapa</div>');
    }
  }

  // Devuelve coordenadas de ciudades (usa caché si existe).
  async cityCoords() {
    if (this.coordsCache) return this.coordsCache;

    return new Promise((resolve, reject) => {
      $.get('/ciudades')
        .done((data) => {
          const map = {};
          (data || []).forEach(c => {
            const name = c.nombre_ciudad || c.ciudad || c.nombre;
            const lat = parseFloat(c.latitud);
            const lng = parseFloat(c.longitud);
            if (name && isFinite(lat) && isFinite(lng)) {
              map[name] = { lat, lng, pais: c.pais || '' };
            }
          });
          this.coordsCache = map;
          resolve(this.coordsCache);
        })
        .fail(err => reject(err));
    });
  }

  aggregateByCity(data, config) {
    const result = {};
    const cityField = config?.locationField;
    if (!cityField) return result;

    (data || []).forEach(item => {
      const city = item[cityField];
      if (!city) return;

      if (!result[city]) {
        result[city] = { count: 0, importeTotal: 0, relacionesTotal: 0 };
      }

      result[city].count += 1;

      const numericField = config.numberField;
      let importeVal = 0;
      if (numericField && item[numericField] != null && !isNaN(parseFloat(item[numericField]))) {
        importeVal = parseFloat(item[numericField]);
      } else if (!numericField && typeof item.importe === 'number') {
        importeVal = parseFloat(item.importe) || 0;
      }
      result[city].importeTotal += importeVal;

      result[city].relacionesTotal += this.getRelacionesCount(item);
    });

    return result;
  }

  getRelacionesCount(item) {
    // Estima número de relaciones por registro.
    if (typeof item.relaciones_count === 'number') return item.relaciones_count;
    if (typeof item.endosos_count === 'number') return item.endosos_count;
    if (typeof item.roles_count === 'number') return item.roles_count;

    let count = 0;
    if (Array.isArray(item.letras)) count = Math.max(count, item.letras.length);
    if (Array.isArray(item.endosos)) count = Math.max(count, item.endosos.length);
    if (Array.isArray(item.roles)) count = Math.max(count, item.roles.length);
    if (Array.isArray(item.roles_letra)) count = Math.max(count, item.roles_letra.length);
    if (Array.isArray(item.letra_endosos)) count = Math.max(count, item.letra_endosos.length);
    return count;
  }

  getMetricValue(stats, metric) {
    if (metric === 'importe') return stats.importeTotal || 0;
    if (metric === 'relaciones') return stats.relacionesTotal || 0;
    return stats.count || 0;
  }

  calculateRadius(value, maxValue) {
    if (!isFinite(value) || value <= 0) return 4;
    if (!isFinite(maxValue) || maxValue <= 0) return 6;
    const minSize = 5;
    const maxSize = 18;
    const logV = Math.log(value + 1);
    const logMax = Math.log(maxValue + 1);
    return minSize + (logV / logMax) * (maxSize - minSize);
  }

  calculateColor(value, maxValue) {
    if (!isFinite(value) || !isFinite(maxValue) || maxValue <= 0) {
      return 'hsl(0, 60%, 85%)';
    }
    const ratio = Math.max(0, Math.min(1, value / maxValue));
    const lightness = 85 - Math.round(ratio * 45);
    return `hsl(0, 85%, ${lightness}%)`;
  }

  formatCurrencyES(amount) {
    const n = Number(amount) || 0;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(n);
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markersLayer = null;
  }
}

document.getElementById('botonAbonoyCesion')?.addEventListener('click', function(event) {
    event.preventDefault(); 
    handleAbonoyCesion();
});