const SARol = require('../negocio/SARol');
const Rol = require('../entidades/Rol');

class RolController {
    // GET all roles
    getAll(req, res) {
        SARol.getAllRoles((err, roles) => {
            if (err) {
                console.error('Error in RolController.getAll:', err);
                return res.status(500).json({ error: 'Error getting roles' });
            }
            const rolesJSON = roles.map(rol => rol.toJSON());
            res.json(rolesJSON);
        });
    }

    // GET roles by type
    getByType(req, res) {
        const tipo = req.params.tipo;
        
        SARol.getRolesByType(tipo, (err, roles) => {
            if (err) {
                console.error('Error in RolController.getByType:', err);
                return res.status(500).json({ 
                    error: err.message || 'Error getting roles by type' 
                });
            }
            
            const rolesJSON = roles.map(rol => rol.toJSON());
            res.json(rolesJSON);
        });
    }

    // GET role by ID
    getById(req, res) {
        const id = req.params.id;
        
        SARol.getRolById(id, (err, rol) => {
            if (err) {
                console.error('Error in RolController.getById:', err);
                return res.status(500).json({ error: 'Error getting rol' });
            }
            if (!rol) {
                return res.status(404).json({ error: 'Rol not found' });
            }
            
            res.json(rol.toJSON());
        });
    }

    // CREATE new role
    create(req, res) {
        const rolData = {
            nombre_rol: req.body.nombre_rol,
            tipo: req.body.tipo
        };

        SARol.createRol(rolData, (err, rol) => {
            if (err) {
                console.error('Error in RolController.create:', err);
                return res.status(500).json({ 
                    error: err.message || 'Error creating rol',
                    errores: err.errores 
                });
            }
            
            res.status(201).json(rol.toJSON());
        });
    }

    // UPDATE role
    update(req, res) {
        const id = req.params.id;
        const rolData = {
            nombre_rol: req.body.nombre_rol,
            tipo: req.body.tipo
        };

        SARol.updateRol(id, rolData, (err, rol) => {
            if (err) {
                console.error('Error in RolController.update:', err);
                return res.status(500).json({ 
                    error: err.message || 'Error updating rol',
                    errores: err.errores 
                });
            }
            
            res.json(rol.toJSON());
        });
    }

    // DELETE role
    delete(req, res) {
        const id = req.params.id;
        
        SARol.deleteRol(id, (err, result) => {
            if (err) {
                console.error('Error in RolController.delete:', err);
                return res.status(500).json({ 
                    error: err.message || 'Error deleting rol' 
                });
            }
            res.json(result);
        });
    }
}

module.exports = new RolController();