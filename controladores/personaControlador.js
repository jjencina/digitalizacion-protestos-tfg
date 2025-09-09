const SAPersona = require('../negocio/SAPersona');
const Persona = require('../entidades/Persona');

class PersonaController {
    // GET all personas
    getAll(req, res) {
        SAPersona.getAllPersonas((err, personas) => {
            if (err) {
                console.error('Error in PersonaController.getAll:', err);
                return res.status(500).json({ error: 'Error getting personas' });
            }
            
            const personasJSON = personas.map(persona => persona.toJSON());
            res.json(personasJSON);
        });
    }

    // GET persona by ID
    getById(req, res) {
        const id = req.params.id;
        SAPersona.getPersonaById(id, (err, persona) => {
            if (err) {
                console.error('Error in PersonaController.getById:', err);
                return res.status(500).json({ error: 'Error getting persona' });
            }
            if (!persona) {
                return res.status(404).json({ error: 'Persona not found' });
            }
            
            res.json(persona.toJSON());
        });
    }

    // CREATE new persona
    create(req, res) {
        const personaData = {
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            fecha_nacimiento: req.body.fecha_nacimiento || null,
            pais: req.body.pais,
            fecha_muerte: req.body.fecha_muerte || null
        };

        SAPersona.createPersona(personaData, (err, persona) => {
            if (err) {
                console.error('Error in PersonaController.create:', err);
                return res.status(500).json({ 
                    error: err.message || 'Error creating persona',
                    errores: err.errores 
                });
            }
            
            res.status(201).json(persona.toJSON());
        });
    }

    // UPDATE persona
    update(req, res) {
        const id = req.params.id;
        const personaData = {
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            fecha_nacimiento: req.body.fecha_nacimiento || null,
            pais: req.body.pais,
            fecha_muerte: req.body.fecha_muerte || null
        };

        SAPersona.updatePersona(id, personaData, (err, persona) => {
            if (err) {
                console.error('Error in PersonaController.update:', err);
                return res.status(500).json({ 
                    error: err.message || 'Error updating persona',
                    errores: err.errores 
                });
            }
            
            res.json(persona.toJSON());
        });
    }

    // DELETE persona
    delete(req, res) {
        const id = req.params.id;
        SAPersona.deletePersona(id, (err, result) => {
            if (err) {
                console.error('Error in PersonaController.delete:', err);
                return res.status(500).json({ error: err.message || 'Error deleting persona' });
            }
            res.json(result);
        });
    }

    // SEARCH personas
    search(req, res) {
        const query = req.query.q;
        if (!query) {
            return res.json([]);
        }

        SAPersona.searchPersonas(query, (err, personas) => {
            if (err) {
                console.error('Error in PersonaController.search:', err);
                return res.status(500).json({ error: 'Error searching personas' });
            }
            
            const personasJSON = personas.map(persona => persona.toJSON());
            res.json(personasJSON);
        });
    }

}

module.exports = new PersonaController();