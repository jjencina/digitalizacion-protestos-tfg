const express = require('express');
const router = express.Router();
const TipoLetraController = require('../controladores/tipoLetraControlador');

// CRUD tipos de letra
router.get('/search', TipoLetraController.search);

router.get('/', TipoLetraController.getAll);

router.get('/:id', TipoLetraController.getById);

router.post('/', TipoLetraController.create);

router.put('/:id', TipoLetraController.update);

router.delete('/:id', TipoLetraController.delete);

module.exports = router;