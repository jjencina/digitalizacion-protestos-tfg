// Empecé a crear clases para mantener mas claro el código, exportar json e importar pero ya estaba todo implementado asique habria que refactoriazar todo
class Ciudad {
    constructor(data = {}) {
        this.id_ciudad = data.id_ciudad || null;
        this.nombre_ciudad = data.nombre_ciudad || '';
        this.pais = data.pais || '';
        this.latitud = data.latitud || null;
        this.longitud = data.longitud || null;
    }

    getNombreCompleto() {
        if (this.pais && this.pais.trim() !== '') {
            return `${this.nombre_ciudad}, ${this.pais}`;
        }
        return this.nombre_ciudad;
    }

    hasCoordinates() {
        return this.latitud !== null && this.longitud !== null;
    }

    validar() {
        const errores = [];
        
        if (!this.nombre_ciudad || this.nombre_ciudad.trim() === '') 
            errores.push('El nombre de la ciudad es obligatorio');    
        if (this.nombre_ciudad && this.nombre_ciudad.length > 100)
            errores.push('El nombre de la ciudad no puede exceder 100 caracteres');      
        if (this.pais && this.pais.length > 100) 
            errores.push('El nombre del país no puede exceder 100 caracteres');
        
        // Validar coordenadas
        if (this.latitud !== null) {
            if (isNaN(this.latitud) || this.latitud < -90 || this.latitud > 90) {
                errores.push('La latitud debe estar entre -90 y 90 grados');
            }
        }
        if (this.longitud !== null) {
            if (isNaN(this.longitud) || this.longitud < -180 || this.longitud > 180) {
                errores.push('La longitud debe estar entre -180 y 180 grados');
            }
        }
        
        return errores;
    }

    toDatabase() {
        return {
            id_ciudad: this.id_ciudad,
            nombre_ciudad: this.nombre_ciudad,
            pais: this.pais,
            latitud: this.latitud,
            longitud: this.longitud
        };
    }

    toJSON() {
        return {
            id_ciudad: this.id_ciudad,
            nombre_ciudad: this.nombre_ciudad,
            pais: this.pais,
            latitud: this.latitud,
            longitud: this.longitud,
            nombreCompleto: this.getNombreCompleto(),
            hasCoordinates: this.hasCoordinates()
        };
    }

    static fromDatabase(row) {
        return new Ciudad({
            id_ciudad: row.id_ciudad,
            nombre_ciudad: row.nombre_ciudad,
            pais: row.pais,
            latitud: row.latitud,
            longitud: row.longitud
        });
    }

    static fromNombre(nombreCompleto) {
        const parts = nombreCompleto.split(',');
        const nombre = parts[0].trim();
        const pais = parts.length > 1 ? parts[1].trim() : '';
        
        return new Ciudad({
            nombre_ciudad: nombre,
            pais: pais
        });
    }
}

module.exports = Ciudad;