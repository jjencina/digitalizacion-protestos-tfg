class Rol {
    constructor(data = {}) {
        this.id_rol = data.id_rol || null;
        this.nombre_rol = data.nombre_rol || '';
        this.tipo = data.tipo || '';
    }

    validar() {
        const errores = [];
        
        if (!this.nombre_rol || this.nombre_rol.trim() === '') {
            errores.push('El nombre del rol es obligatorio');
        }
        
        if (!this.tipo || this.tipo.trim() === '') {
            errores.push('El tipo de rol es obligatorio');
        }
        
        const tiposValidos = ['protesto', 'letracambio', 'endoso'];
        if (!tiposValidos.includes(this.tipo)) {
            errores.push('El tipo de rol debe ser: protesto, letracambio o endoso');
        }
        
        return errores;
    }

    toDatabase() {
        return {
            id_rol: this.id_rol,
            nombre_rol: this.nombre_rol,
            tipo: this.tipo
        };
    }

    toJSON() {
        return {
            id_rol: this.id_rol,
            nombre_rol: this.nombre_rol,
            tipo: this.tipo
        };
    }

    static fromDatabase(row) {
        return new Rol({
            id_rol: row.id_rol,
            nombre_rol: row.nombre_rol,
            tipo: row.tipo
        });
    }

    esDeTipo(tipo) {
        return this.tipo === tipo;
    }

    esRolProtesto() {
        return this.tipo === 'protesto';
    }

    esRolLetra() {
        return this.tipo === 'letracambio';
    }

    esRolEndoso() {
        return this.tipo === 'endoso';
    }
}

module.exports = Rol;