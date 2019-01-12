// Requires
const express = require('express');
const mongoose = require('mongoose');



// Inicicalizar variables
const app = express();



// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});



// Rutas
app.get('/', (req, res, next) => {

    res.status(200);

    res.json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});




// Escuchar peticiones
app.listen(3000, () => console.log('Server listening at port 3000: \x1b[32m%s\x1b[0m', 'online'));