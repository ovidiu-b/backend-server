const express = require('express');
const app = express();
const mdAutenticacion = require('../middlewares/autenticacion');

const Hospital = require('../models/hospital');


// ====================================
//  Obtener todos los hospitales
// ====================================
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;

    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            if (!hospitales) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existen hospitales'
                });
            }

            Hospital.count({}, (err, cantidadTotal) => {

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: cantidadTotal
                });

            });
        });
});



// ====================================
//  Crear hospital
// ====================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;

    const newHospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario._id
    });

    newHospital.save((err, hospitalCreado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalCreado
        });
    });
});


// ====================================
//  Actualizar hospital
// ====================================
app.put('/', mdAutenticacion.verificaToken, (req, res) => {
    const hospitalToUpdate = req.body.hospital;

    Hospital
        .findByIdAndUpdate(
            hospitalToUpdate._id,

            {
                nombre: hospitalToUpdate.nombre,
                img: hospitalToUpdate.img
            },

            {
                new: false
            },

            (err, hospitalUpdated) => {

                if (err || !hospitalUpdated) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }

                res.status(201).json({
                    ok: true,
                    hospital: hospitalUpdated
                });
            });
});


// ====================================
//  Borrar hospital
// ====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `Se ha producido un error al intentar borrar el hospital`,
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;