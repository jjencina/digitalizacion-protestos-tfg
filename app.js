var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const personaRoutes = require('./routes/personaRoutes');
const ciudadRoutes = require('./routes/ciudadRoutes');
const protestoRoutes = require('./routes/protestoRoutes');
const monedaRoutes = require('./routes/monedaRoutes');
const rolRoutes = require('./routes/rolRoutes');
const formularioRoutes = require('./routes/formularioRoutes');
const endosoRoutes = require('./routes/endosoRoutes');
const letraRoutes = require('./routes/letraCambioRoutes');
const analisisRoutes = require('./routes/analisisRoutes');
const tipoLetraRoutes = require('./routes/tipoLetraRoutes');
const consultarRoutes = require('./routes/consultarRoutes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/personas', personaRoutes);
app.use('/ciudades', ciudadRoutes);
app.use('/protesto', protestoRoutes);
app.use('/monedas', monedaRoutes);
app.use('/roles', rolRoutes);
app.use('/formulario', formularioRoutes);
app.use('/endoso', endosoRoutes);
app.use('/letra', letraRoutes);
app.use('/analisis', analisisRoutes);
app.use('/letra/tipos/letra', tipoLetraRoutes);
app.use('/consultar', consultarRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

module.exports = app;