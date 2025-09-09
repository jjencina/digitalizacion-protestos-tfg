class MapaMundi {
    constructor() {
        this.map = null;
        this.markers = [];
        this.cityData = [];
        this.currentEntityType = 'protestos';
    }

    // Inicializar el mapa
    initMap(containerId) {
        // Crear el mapa centrado en Madrid
        this.map = L.map(containerId, {
            center: [40.4168, -3.7038],
            zoom: 6,
            zoomControl: true,
            attributionControl: true
        });

        // Añadir capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Cargar datos de ciudades
        this.loadCityData();
    }

    // Cargar datos de estadísticas de ciudades
    loadCityData() {
        $.get('/ciudades/estadisticas-mapa')
            .done((data) => {
                this.cityData = data;
                this.updateMapMarkers();
            })
            .fail((error) => {
                console.error('Error cargando datos del mapa:', error);
                this.showMapError('Error cargando datos de ciudades');
            });
    }

    // Actualizar marcadores del mapa según el tipo de entidad
    updateMapMarkers(entityType = 'protestos') {
        this.currentEntityType = entityType;
        
        // Limpiar marcadores
        this.clearMarkers();

        if (!this.cityData || this.cityData.length === 0) {
            this.showMapError('No hay datos de ciudades disponibles');
            return;
        }

        // Crear marcadores para cada ciudad con datos
        this.cityData.forEach(city => {
            if (city.latitud && city.longitud) {
                this.createCityMarker(city);
            }
        });

        // Ajustar vista del mapa para mostrar todos los marcadores
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Crear marcador para una ciudad
    createCityMarker(city) {
        const stats = this.getCityStats(city);
        const radius = this.calculateMarkerSize(stats.value);
        const color = this.getMarkerColor(stats.value);

        // Crear marcador circular
        const marker = L.circleMarker([city.latitud, city.longitud], {
            radius: radius,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        }).addTo(this.map);

        // Crear popup con info
        const popupContent = this.createPopupContent(city, stats);
        marker.bindPopup(popupContent);

        // Tooltip con nombre de ciudad
        marker.bindTooltip(`${city.nombre_ciudad} (${stats.label}: ${stats.displayValue})`, {
            permanent: false,
            direction: 'top',
            offset: [0, -10]
        });

        this.markers.push(marker);
    }

    // Obtener estadísticas según el tipo de entidad seleccionada
    getCityStats(city) {
        switch (this.currentEntityType) {
            case 'protestos':
                return {
                    value: parseInt(city.total_protestos) || 0,
                    label: 'Protestos',
                    displayValue: city.total_protestos || 0
                };
            case 'letras':
                return {
                    value: parseInt(city.total_letras) || 0,
                    label: 'Letras',
                    displayValue: city.total_letras || 0
                };
            case 'endosos':
                return {
                    value: parseInt(city.total_endosos) || 0,
                    label: 'Endosos',
                    displayValue: city.total_endosos || 0
                };
            case 'importe':
                const importe = parseFloat(city.total_importe) || 0;
                return {
                    value: importe,
                    label: 'Importe Total',
                    displayValue: this.formatCurrency(importe)
                };
            default:
                return {
                    value: parseInt(city.total_protestos) || 0,
                    label: 'Protestos',
                    displayValue: city.total_protestos || 0
                };
        }
    }

    // Calcular tamaño del marcador según valor
    calculateMarkerSize(value) {
        if (value === 0) return 5;
        
        // Escala logarítmica
        const minSize = 8;
        const maxSize = 30;
        const logValue = Math.log(value + 1);
        const maxLogValue = Math.log(Math.max(...this.cityData.map(c => 
            this.getCityStats(c).value)) + 1);
        
        return minSize + (logValue / maxLogValue) * (maxSize - minSize);
    }

    // Obtener color del marcador según valor
    getMarkerColor(value) {
        if (value === 0) return '#cccccc';
        // Azul a Rojo
        const intensity = Math.min(value / this.getMaxValue(), 1);
        
        if (intensity < 0.3) return '#3498db'; 
        if (intensity < 0.6) return '#f39c12';
        if (intensity < 0.8) return '#e67e22'; 
        return '#e74c3c'; 
    }

    // Obtener valor máximo para la escala de colores
    getMaxValue() {
        if (!this.cityData || this.cityData.length === 0) return 1; 
        return Math.max(...this.cityData.map(city => 
            this.getCityStats(city).value
        ));
    }

    // Contenido del popup
    createPopupContent(city, stats) {
        return `
            <div class="city-popup">
                <h6><strong>${city.nombre_ciudad}</strong></h6>
                <p class="mb-1"><small>${city.pais}</small></p>
                <hr class="my-2">
                <div class="city-stats">
                    <div class="row">
                        <div class="col-6"><small>Protestos:</small></div>
                        <div class="col-6"><strong>${city.total_protestos || 0}</strong></div>
                    </div>
                    <div class="row">
                        <div class="col-6"><small>Letras:</small></div>
                        <div class="col-6"><strong>${city.total_letras || 0}</strong></div>
                    </div>
                    <div class="row">
                        <div class="col-6"><small>Endosos:</small></div>
                        <div class="col-6"><strong>${city.total_endosos || 0}</strong></div>
                    </div>
                    <div class="row">
                        <div class="col-6"><small>Importe:</small></div>
                        <div class="col-6"><strong>${this.formatCurrency(city.total_importe || 0)}</strong></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Formatear moneda
    formatCurrency(amount) {
        if (!amount || amount === 0) return '0';
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Limpiar marcadores
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    // Mostrar error en mapa
    showMapError(message) {
        if (this.map) {
            const popup = L.popup()
                .setLatLng([40.4168, -3.7038])
                .setContent(`<div class="alert alert-warning">${message}</div>`)
                .openOn(this.map);
        }
    }

    // Destruir  mapa
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
        this.cityData = [];
    }

    refresh() {
        this.loadCityData();
    }

    // Filtrar ciudades por valor mínimo
    filterByValue(minValue) {
        this.clearMarkers();
        
        const filteredCities = this.cityData.filter(city => {
            const stats = this.getCityStats(city);
            return stats.value >= minValue;
        });

        filteredCities.forEach(city => {
            this.createCityMarker(city);
        });
    }
}