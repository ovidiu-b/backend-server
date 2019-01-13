const express = require('express');

const app = express();

// Rutas
app.get('/', (req, res, next) => {

    res.status(200);

    res.json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

module.exports = app;