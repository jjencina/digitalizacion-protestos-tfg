const SAProtesto = require('../negocio/SAProtesto');
const DAOProtesto = require('../integracion/DAOProtesto');


class ProtestoController {
    // GET all protestos
    getAll(req, res) {
      DAOProtesto.getAll((err, protestos) => {
          if (err) {
              console.error('Error al obtener protestos:', err);
              return res.status(500).json({ error: 'Error al obtener los protestos' });
          }
          res.json(protestos);
      });
    }

    // GET protesto by ID
    getById(req, res) {
        const id = req.params.id;
        const SAProtesto = require('../negocio/SAProtesto');

        const getter =
          (typeof SAProtesto.getProtestoById === 'function' && SAProtesto.getProtestoById.bind(SAProtesto)) ||
          (typeof SAProtesto.getById === 'function' && SAProtesto.getById.bind(SAProtesto));

        if (!getter) {
          return res.status(500).json({ error: 'SAProtesto: método getProtestoById/getById no disponible' });
        }

        getter(id, (err, data) => {
          if (err) return res.status(500).json({ error: 'Error obteniendo protesto' });
          if (!data) return res.status(404).json({ error: 'No encontrado' });
          res.json(data);
        });
    }

    // CREATE new protesto
    async create(req, res) {
        try {
            const protestoData = req.body;
            const result = await SAProtesto.createProtestoCompleto(protestoData);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in ProtestoController.create:', error);
            res.status(500).json({ error: 'Error creating protesto' });
        }
    }

    // CREATE new protesto (sin relaciones)
    createSimple(req, res) {
        const protestoData = {
            fecha_protesto: req.body.fecha_protesto,
            archivo: req.body.archivo,
            protocolo: req.body.protocolo,
            pagina: req.body.pagina,
            id_ciudad: req.body.id_ciudad || null,
            id_tipo_letra: req.body.id_tipo_letra || null,
            id_tipo_protesto: req.body.id_tipo_protesto || null,
            motivo: req.body.motivo,
            introduccion: req.body.introduccion,
            fuente: req.body.fuente
        };

        if (!protestoData.fecha_protesto) {
            return res.status(400).json({
                error: 'La fecha de protesto es obligatoria'
            });
        }

        SAProtesto.createProtesto(protestoData, (err, protesto) => {
            if (err) {
                console.error('Error in ProtestoController.createSimple:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error creating protesto'
                });
            }
            
            res.status(201).json(protesto);
        });
    }

    update(req, res) {
        const id = req.params.id;
        const protestoData = {
            fecha_protesto: req.body.fecha_protesto,
            archivo: req.body.archivo,
            protocolo: req.body.protocolo,
            pagina: req.body.pagina,
            id_ciudad: req.body.id_ciudad || null,
            id_tipo_letra: req.body.id_tipo_letra || null,
            id_tipo_protesto: req.body.id_tipo_protesto || null,
            motivo: req.body.motivo,
            introduccion: req.body.introduccion,
            fuente: req.body.fuente
        };

        SAProtesto.updateProtesto(id, protestoData, (err, protesto) => {
            if (err) {
                console.error('Error in ProtestoController.update:', err);
                
                if (err.errores) {
                    return res.status(400).json({ 
                        error: err.message || 'Errores de validación',
                        errores: err.errores 
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error updating protesto'
                });
            }
            
            res.json(protesto);
        });
    }

    // DELETE protesto
    delete(req, res) {
        const id = req.params.id;
        SAProtesto.deleteProtesto(id, (err, result) => {
            if (err) {
                console.error('Error in ProtestoController.delete:', err);
                
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({
                        error: 'No se puede eliminar este protesto porque tiene letras y/o endosos asociados. Elimine primero las relaciones.'
                    });
                }
                
                return res.status(500).json({ 
                    error: err.message || 'Error deleting protesto'
                });
            }
            
            res.json({ success: true, message: 'Protesto eliminado correctamente' });
        });
    }

    // Obtener tipos de protesto
    getTiposProtesto(req, res) {
        SAProtesto.getTiposProtesto((err, tipos) => {
            if (err) {
                console.error('Error getting tipos protesto:', err);
                return res.status(500).json({error: 'Error loading tipos protesto'});
            }
            res.json(tipos);
        });
    }

    //Eliminar un tipo de protesto
    deleteTipoProtesto(req, res) {
        const id = req.params.id;
        if (!id) { 
            return res.status(400).json({ error: 'ID is required' });
        }
        
        SATipoProtesto.deleteTipoProtesto(id, (err, result) => {    
            if (err) {
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    return res.status(400).json({
                        error: 'No se puede eliminar este tipo de protesto porque está siendo utilizado en uno o más protestos'
                    });
                }
                
                console.error('Error eliminando tipo de protesto:', err);
                return res.status(500).json({ error: 'Error al eliminar el tipo de protesto' });
            }
            res.json(result);
        });
    }

    searchTiposProtesto(req, res) {
        const query = req.query.q || '';
        
        SAProtesto.searchTiposProtesto(query, (err, tipos) => {
            if (err) {
                console.error('Error searching tipos protesto:', err);
                return res.status(500).json({ error: 'Error searching tipos protesto' });
            }
            res.json(tipos);
        });
    }

    getAllRelacionesProtestos(req, res) {
        SAProtesto.getAllRelacionesProtestos((err, relaciones) => {
            if (err) {
                console.error('Error in LetraController.getAllRelacionesProtestos:', err);
                return res.status(500).json({ error: 'Error getting relaciones' });
            }
            res.json(relaciones);
        });
    }

    getRelacionProtestoById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SAProtesto.getRelacionProtestoById(id, (err, relacion) => {
            if (err) {
                console.error('Error in LetraController.getRelacionProtestoById:', err);
                return res.status(500).json({ error: 'Error getting relacion' });
            }
            if (!relacion) {
                return res.status(404).json({ error: 'Relación not found' });
            }
            res.json(relacion);
        });
    }

    createRelacionProtesto(req, res) {
        const { id_protesto, id_letra } = req.body;

        if (!id_protesto || !id_letra) {
            return res.status(400).json({ error: 'Protesto ID and Letra ID are required' });
        }

        SAProtesto.createRelacionProtesto(req.body, (err, result) => {
            if (err) {
                console.error('Error in LetraController.createRelacionProtesto:', err);
                return res.status(500).json({ error: 'Error creating relacion' });
            }
            res.status(201).json(result);
        });
    }

    updateRelacionProtesto(req, res) {
        const id = req.body.id_relacion;
        if (!id) {
            return res.status(400).json({ error: 'Relation ID is required' });
        }

        const { id_protesto, id_letra } = req.body;
        if (!id_protesto || !id_letra) {
            return res.status(400).json({ error: 'Protesto ID and Letra ID are required' });
        }

        SAProtesto.updateRelacionProtesto(id, req.body, (err, result) => {
            if (err) {
                console.error('Error in LetraController.updateRelacionProtesto:', err);
                return res.status(500).json({ error: 'Error updating relacion' });
            }
            res.json(result);
        });
    }

    deleteRelacionProtesto(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        SAProtesto.deleteRelacionProtesto(id, (err, result) => {
            if (err) {
                console.error('Error in LetraController.deleteRelacionProtesto:', err);
                return res.status(500).json({ error: 'Error deleting relacion' });
            }
            res.json(result);
        });
    }

    getLetrasByProtesto(req, res) {
        const protestoId = req.params.protestoId;
        if (!protestoId) {
            return res.status(400).json({ error: 'Protesto ID is required' });
        }

        SAProtesto.getLetrasByProtesto(protestoId, (err, letras) => {
            if (err) {
                console.error('Error in LetraController.getLetrasByProtesto:', err);
                return res.status(500).json({ error: 'Error getting letras' });
            }
            res.json(letras);
        });
    }

    getProtestosByLetra(req, res) {
        const letraId = req.params.letraId;
        if (!letraId) {
            return res.status(400).json({ error: 'Letra ID is required' });
        }

        SAProtesto.getProtestosByLetra(letraId, (err, protestos) => {
            if (err) {
                console.error('Error in LetraController.getProtestosByLetra:', err);
                return res.status(500).json({ error: 'Error getting protestos' });
            }
            res.json(protestos);
        });
    }

    getFiltered(req, res) {
        const filtros = {
            fechaDesde: req.query.fechaDesde,
            fechaHasta: req.query.fechaHasta,
            tipoProtesto: req.query.tipoProtesto ? 
                Array.isArray(req.query.tipoProtesto) ? req.query.tipoProtesto : [req.query.tipoProtesto] : [],
            tipoLetra: req.query.tipoLetra ? 
                Array.isArray(req.query.tipoLetra) ? req.query.tipoLetra : [req.query.tipoLetra] : [],
            ciudad: req.query.ciudad ? 
                Array.isArray(req.query.ciudad) ? req.query.ciudad : [req.query.ciudad] : [],
            persona: req.query.persona ? 
                Array.isArray(req.query.persona) ? req.query.persona : [req.query.persona] : [],
            rol: req.query.rol ? 
                Array.isArray(req.query.rol) ? req.query.rol : [req.query.rol] : [],
            importeDesde: req.query.importeDesde,
            importeHasta: req.query.importeHasta,
            moneda: req.query.moneda ? 
                Array.isArray(req.query.moneda) ? req.query.moneda : [req.query.moneda] : [],
            tipoNegociacion: req.query.tipoNegociacion ? 
                Array.isArray(req.query.tipoNegociacion) ? req.query.tipoNegociacion : [req.query.tipoNegociacion] : []
        };
    
        console.log("Filtros recibidos:", filtros);
    
        DAOProtesto.getAll((err, protestos) => {
            if (err) {
                console.error('Error al obtener protestos filtrados:', err);
                return res.status(500).json({ error: 'Error al obtener los protestos filtrados' });
            }
            
            let filtrados = protestos;
            
            if (filtros.fechaDesde) {
                const fechaDesde = new Date(filtros.fechaDesde);
                filtrados = filtrados.filter(p => new Date(p.fecha_protesto) >= fechaDesde);
            }
            
            if (filtros.fechaHasta) {
                const fechaHasta = new Date(filtros.fechaHasta);
                filtrados = filtrados.filter(p => new Date(p.fecha_protesto) <= fechaHasta);
            }
            
            
            // Verificar el formato
            if (req.query.formato === 'sql') {
                // Generar SQL - código existente
                const sqlContent = this.generateSQL(filtrados);
                
                // Configurar cabeceras para descarga
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename=exportacion_protestos_${new Date().toISOString().split('T')[0]}.sql`);
                
                // Enviar el SQL
                return res.send(sqlContent);
            } 
            // NO SE USA
            else if (req.query.formato === 'json') {
                // Para JSON, simplemente devolvemos los datos con header de descarga
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=exportacion_protestos_${new Date().toISOString().split('T')[0]}.json`);
                
                return res.json(filtrados);
            }
            res.json(filtrados);
        });
    }
}

module.exports = new ProtestoController();

