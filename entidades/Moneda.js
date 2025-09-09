class Moneda {
    constructor(data = {}) {
        this.id_moneda = data.id_moneda || null;
        this.nombre_moneda = data.nombre_moneda || '';
    }

    validar() {
        const errores = [];     
        if (!this.nombre_moneda || this.nombre_moneda.trim() === '')
            errores.push('El nombre de la moneda es obligatorio');
        if (this.nombre_moneda && this.nombre_moneda.length < 2)
            errores.push('El nombre de la moneda debe tener al menos 2 caracteres');        
        return errores;
    }

    toDatabase() {
        return {
            id_moneda: this.id_moneda,
            nombre_moneda: this.nombre_moneda
        };
    }

    toJSON() {
        return {
            id_moneda: this.id_moneda,
            nombre_moneda: this.nombre_moneda
        };
    }

    static fromDatabase(row) {
        return new Moneda({
            id_moneda: row.id_moneda,
            nombre_moneda: row.nombre_moneda
        });
    }

    static fromNombre(nombre) {
        return new Moneda({
            nombre_moneda: nombre.trim()
        });
    }
}

module.exports = Moneda;