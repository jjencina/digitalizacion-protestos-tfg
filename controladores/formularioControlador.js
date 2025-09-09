const SAFormulario = require('../negocio/SAFormulario');
const DAOFormulario = require('../integracion/DAOFormulario');

class FormularioController {
  save(req, res) {
    console.log('Starting save operation with data:', JSON.stringify(req.body, null, 2));
    
    const formData = req.body;
    
    if (formData && formData.roles_adicionales && formData.roles_adicionales.length) {
        console.log(`Recibidos ${formData.roles_adicionales.length} roles adicionales para el protesto`);
        console.table(formData.roles_adicionales);
    } else {
        console.log('No se recibieron roles adicionales para el protesto');
    }

    if (formData && formData.letras && formData.letras.length) {
        formData.letras.forEach((letra, letraIndex) => {
            if (letra.roles_adicionales && letra.roles_adicionales.length) {
                console.log(`Recibidos ${letra.roles_adicionales.length} roles adicionales para la letra ${letraIndex}`);
                console.table(letra.roles_adicionales);
            }
            if (letra.endosos && letra.endosos.length) {
                letra.endosos.forEach((endoso, endosoIndex) => {
                    if (endoso.roles_adicionales && endoso.roles_adicionales.length) {
                        console.log(`Recibidos ${endoso.roles_adicionales.length} roles adicionales para el endoso ${endosoIndex} de la letra ${letraIndex}`);
                        console.table(endoso.roles_adicionales);
                    }
                });
            }
        });
    }
    
    if (!formData) {
        return res.status(400).json({ 
            success: false,
            error: 'Missing form data'
        });
    }
    
    SAFormulario.saveForm(formData, (err, result) => {
        if (err) {
            console.error('Error saving form:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al guardar el formulario',
                details: err.details || err.message || 'Unknown error'
            });
        }
        
        console.log('Form successfully saved:', result);
        res.json({
            success: true,
            protestoId: result.protestoId,
            message: 'Protesto guardado correctamente'
        });
    });
  }

  updateField(req, res) {
    const id = req.params.id;
    const updateData = req.body;
    
    SAProtesto.updateField(id, updateData, (err, result) => {
        if (err) {
            console.error('Error updating field:', err);
            return res.status(500).json({ error: 'Error updating field' });
        }
        res.json({ success: true });
    });
  }

  getLastProtesto(req, res) {
    try {
      DAOFormulario.getLastProtesto((err, lastProtesto) => {
        if (err) {
          console.error('Error obteniendo último protesto:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(lastProtesto || {});
      });
    } catch (error) {
      console.error('Error en getLastProtesto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new FormularioController();