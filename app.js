// Requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');



// Inicicalizar variables
const app = express();




// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    next();
});




// Body Parser
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());



// Importar rutas
const imagenesRoutes = require('./routes/imagenes');
const uploadRoutes = require('./routes/upload');
const busquedaRoutes = require('./routes/busqueda');
const medicoRoutes = require('./routes/medico');
const hospitalRoutes = require('./routes/hospital');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');
const appRoutes = require('./routes/app');



// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});




// Rutas
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);



// Escuchar peticiones
app.listen(3000, () => console.log('Server listening at port 3000: \x1b[32m%s\x1b[0m', 'online'));