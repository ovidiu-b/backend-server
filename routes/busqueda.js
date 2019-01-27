const express = require('express');
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

const app = express();

// ====================================
//  Busqueda de medicos
// ====================================
app.get('/medico/:busqueda', (req, res) => {
    let busqueda = req.params.busqueda;

    let regex = new RegExp(busqueda, 'i');

    buscarMedicos(busqueda, regex)
        .then(medicos => {
            res.status(200).json({
                ok: true,
                medicos
            });
        })
        .catch(err => {

        });
});



// ====================================
//        Busqueda de hospitales
// ====================================
app.get('/hospital/:busqueda', (req, res) => {
    let busqueda = req.params.busqueda;

    console.log("EN hospital" + busqueda);

    let regex = new RegExp(busqueda, 'i');

    buscarHospitales(busqueda, regex)
        .then(hospitales => {
            res.status(200).json({
                ok: true,
                hospitales: hospitales
            });
        })
        .catch(err => {

        });
});



// ====================================
//  Busqueda de usuarios
// ====================================
app.get('/usuario/:busqueda', (req, res) => {
    let busqueda = req.params.busqueda;

    let regex = new RegExp(busqueda, 'i');

    buscarUsuarios(busqueda, regex)
        .then(usuarios => {
            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        })
        .catch(err => {

        });
});




// ====================================
//  Busqueda general
// ====================================
app.get('/todo/:busqueda', (req, res) => {

    let busqueda = req.params.busqueda;

    let regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })
        .catch(err => {

        });

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                console.log(hospitales);


                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });

    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .populate('hospita')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(medicos);
                }

            });

    });

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email')
            .or([{
                'nombre': regex
            }, {
                'email': regex
            }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}

module.exports = app;