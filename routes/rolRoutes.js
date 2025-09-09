const express = require('express');
const router = express.Router();
const RolController = require('../controladores/rolControlador');

// CRUD Roles

router.get('/', RolController.getAll);

// GET roles por tipo (protesto, letracambio, endoso)
router.get('/tipo/:tipo', RolController.getByType);

router.get('/:id', RolController.getById);

router.post('/', RolController.create);

router.put('/:id', RolController.update);

router.delete('/:id', RolController.delete);


module.exports = router;