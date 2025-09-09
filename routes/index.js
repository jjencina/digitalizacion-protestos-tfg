var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/formulario', function(req, res, next) {
  res.render('formulario/formulario', { title: 'Formulario Protestos' });
});

router.get('/partials/letra', (req, res) => {
  res.render('formulario/letra', { 
    letraIndex: parseInt(req.query.letraIndex) 
  });
});

router.get('/partials/endoso', (req, res) => {
  res.render('formulario/endoso', {
    letraIndex: parseInt(req.query.letraIndex),
    endosoIndex: parseInt(req.query.endosoIndex)
  });
});

module.exports = router;
