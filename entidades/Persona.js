class Persona {
    constructor(data = {}) {
        this.id_persona = data.id_persona || null;
        this.nombre = data.nombre || '';
        this.apellidos = data.apellidos || null;
        this.fecha_nacimiento = data.fecha_nacimiento || null;
        this.pais = data.pais || null;
        this.fecha_muerte = data.fecha_muerte || null;
    }

    getNombreCompleto() {
        return `${this.nombre} ${this.apellidos || ''}`.trim();
    }

    
    validar() {
        const errores = [];
        
        if (!this.nombre || this.nombre.trim() === '') {
            errores.push('El nombre es obligatorio');
        }
        
        if (this.fecha_nacimiento && this.fecha_muerte) {
            const fechaNac = new Date(this.fecha_nacimiento);
            const fechaMuerte = new Date(this.fecha_muerte);
            if (fechaMuerte < fechaNac) {
                errores.push('La fecha de muerte no puede ser anterior a la de nacimiento');
            }
        }
        
        return errores;
    }

    // NO se usa, prueba para realizar importaciones
    toDatabase() {
        return {
            id_persona: this.id_persona,
            nombre: this.nombre,
            apellidos: this.apellidos,
            fecha_nacimiento: this.fecha_nacimiento,
            pais: this.pais,
            fecha_muerte: this.fecha_muerte
        };
    }

    // No se usa
    toJSON() {
        return {
            id_persona: this.id_persona,
            nombre: this.nombre,
            apellidos: this.apellidos,
            nombreCompleto: this.getNombreCompleto(),
            fecha_nacimiento: this.fecha_nacimiento,
            pais: this.pais,
            fecha_muerte: this.fecha_muerte
        };
    }

    static fromDatabase(row) {
        return new Persona({
            id_persona: row.id_persona,
            nombre: row.nombre,
            apellidos: row.apellidos,
            fecha_nacimiento: row.fecha_nacimiento,
            pais: row.pais,
            fecha_muerte: row.fecha_muerte
        });
    }

    static fromNombre(nombreCompleto) {
        const [nombre, ...apellidosParts] = nombreCompleto.trim().split(' ');
        const apellidos = apellidosParts.join(' ') || null;
        
        return new Persona({
            nombre: nombre,
            apellidos: apellidos
        });
    }
}

module.exports = Persona;