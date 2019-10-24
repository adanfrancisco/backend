// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



// Inicializar variables
var app = express();

//Body Parser
// analizar la aplicación / x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// conexion a la base de datos
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos corriendo en puerto 27017 \x1b[32m%s\x1b[0m', ' online');
});


//rutas
app.use('/', appRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en puerto 3000 \x1b[32m%s\x1b[0m', ' online');
});