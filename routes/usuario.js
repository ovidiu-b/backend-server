const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
const mdAutenticacion = require('../middlewares/autenticacion');

const Usuario = require('../models/usuario');


// ====================================
//  Obtener todos los usuarios
// ====================================
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;

    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, cantidadTotal) => {

                    res.status(200).json({
                        ok: true,
                        usuarios,
                        total: cantidadTotal
                    });

                });

            }
        );

});


// ====================================
//  Crear nuevo usuario
// ====================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;

    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role.toUpperCase()
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});


// ====================================
//  Actualizar usuario
// ====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'El usuario no existe',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + " no existe",
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        const body = req.body;

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role.toUpperCase();

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});


// ====================================
//  Borrar usuario
// ====================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;