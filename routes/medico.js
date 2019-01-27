const express = require('express');
const app = express();
const mdAutenticacion = require('../middlewares/autenticacion');

const Medico = require('../models/medico');


// ====================================
//  Obtener todos los medicos
// ====================================
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;

    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            if (!medicos) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existen medicos'
                });
            }

            Medico.count({}, (err, cantidadTotal) => {

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: cantidadTotal
                });

            });
        });
});


// ====================================
//  Crear medico
// ====================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;

    const newMedico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario_id,
        hospital: body.hospital_id
    });

    newMedico.save((err, medicoCreado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }


        res.status(201).json({
            ok: true,
            medico: medicoCreado
        });
    });
});

// ====================================
//  Actualizar medico
// ====================================
app.put('/', mdAutenticacion.verificaToken, (req, res) => {
    const medicoBody = req.body.medico;

    Medico
        .findByIdAndUpdate(
            medicoBody._id,

            {
                nombre: medicoBody.nombre,
                img: medicoBody.img,
                hospital: medicoBody.hospital
            },

            (err, medicoUpdated) => {
                if (err || !medicoUpdated) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el medico',
                        errors: err
                    });

                }

                res.status(201).json({
                    ok: true,
                    medico: medicoUpdated
                });
            }
        );
});


// ====================================
//  Borrar medico
// ====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoDeleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `Se ha producido un error al intentar borrar el medico`,
                errors: err
            });
        }

        if (!medicoDeleted) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medicoDeleted
        });
    });
});

module.exports = app;