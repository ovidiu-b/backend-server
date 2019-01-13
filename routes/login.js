const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;
const app = express();

const Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    const body = req.body;

    const email = body.email;

    Usuario.findOne({
        email
    }, (err, usuarioEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuarioEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `Usuario con email ${email} no encontrado`,
                errors: {
                    message: 'No existe un usuario con ese email registrado en esta página web'
                }
            });
        }

        const password = body.password;

        if (!bcrypt.compareSync(password, usuarioEncontrado.password)) {

            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas`,
                errors: {
                    message: 'Credenciales incorrectas'
                }
            });

        } else {

            usuarioEncontrado.password = '.I.';

            const token = jwt.sign({
                usuario: usuarioEncontrado
            }, SEED, {
                expiresIn: 14400
            });

            res.status(200).json({
                ok: true,
                usuario: usuarioEncontrado,
                token: token,
                id: usuarioEncontrado._id
            });

        }
    });
});

module.exports = app;