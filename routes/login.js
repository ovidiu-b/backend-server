const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;
const app = express();

const Usuario = require('../models/usuario');

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {
    OAuth2Client
} = require('google-auth-library');

const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

// ============================================
// Autentificacion google
// ============================================
app.post('/google', async (req, res) => {

    const token = req.body.token;

    const googleUser = await verify(token).catch(e => {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido'
        });
    });

    Usuario.findOne({
        email: googleUser.email
    }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                    errors: err
                });
            } else {
                const token = jwt.sign({
                    usuario: usuarioDB
                }, SEED, {
                    expiresIn: 14400
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // El usuario no existe... hay que crearlo

            const usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                const token = jwt.sign({
                    usuario: usuarioDB
                }, SEED, {
                    expiresIn: 14400
                });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            });
        }
    });
});



// ============================================
// Autentificacion normal
// ============================================
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
                id: usuarioEncontrado._id,
                menu: obtenerMenu(usuarioEncontrado.role)
            });
        }
    });
});

function obtenerMenu(rol) {
    let menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [{
                    titulo: 'Dashboard',
                    url: '/dashboard'
                },
                {
                    titulo: 'ProgressBar',
                    url: '/progress'
                },
                {
                    titulo: 'Gráficas',
                    url: '/graficas1'
                },
                {
                    titulo: 'Promesas',
                    url: '/promesas'
                },
                {
                    titulo: 'RxJS',
                    url: '/rxjs'
                }
            ]
        },

        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [{
                    titulo: 'Hospitales',
                    url: '/hospitales'
                },
                {
                    titulo: 'Medicos',
                    url: '/medicos'
                },
            ]
        }
    ];

    if (rol === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({
            titulo: 'Usuarios',
            url: '/usuarios'
        });
    }

    return menu;
}

module.exports = app;