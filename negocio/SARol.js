const DAORol = require('../integracion/DAORol');
const Rol = require('../entidades/Rol');

class SARol {
    createRol(rolData, callback) {
        const rol = rolData instanceof Rol ? rolData : new Rol(rolData);

        const errores = rol.validar();
        if (errores.length > 0) {
            return callback({ 
                message: 'Datos inválidos', 
                errores: errores 
            });
        }

        DAORol.create(rol, callback);
    }

    getAllRoles(callback) {
        DAORol.getAll(callback);
    }

    getRolesByType(tipo, callback) {
        if (!this.validateTipoRol(tipo)) {
            return callback({ message: 'Tipo de rol inválido' });
        }
        DAORol.getByType(tipo, callback);
    }

    getRolById(id, callback) {
        if (!id) {
            return callback({ message: 'ID obligatorio' });
        }
        DAORol.getById(id, callback);
    }

    updateRol(id, rolData, callback) {
        if (!id) {
            return callback({ message: 'ID requerido' });
        }
        const rol = rolData instanceof Rol ? rolData : new Rol(rolData);

        const errores = rol.validar();
        if (errores.length > 0) {
            return callback({ 
                message: 'Datos inválidos', 
                errores: errores 
            });
        }

        DAORol.update(id, rol, callback);
    }

    deleteRol(id, callback) {
        if (!id) {
            return callback({ message: 'Id requerido' });
        }
        DAORol.delete(id, callback);
    }

    validateRolData(data) {
        const rol = new Rol(data);
        return rol.validar().length === 0;
    }

    validateTipoRol(tipo) {
        const tiposValidos = ['protesto', 'letracambio', 'endoso'];
        return tiposValidos.includes(tipo);
    }

    getRolesProtesto(callback) {
        this.getRolesByType('protesto', callback);
    }

    getRolesLetra(callback) {
        this.getRolesByType('letracambio', callback);
    }

    getRolesEndoso(callback) {
        this.getRolesByType('endoso', callback);
    }
}

module.exports = new SARol();