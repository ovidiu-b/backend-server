const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

// ====================================
//  Verificar token
// ====================================
exports.verificaToken = function (req, res, next) {

    const token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Acceso no autorizado - Token no válido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });

}


// ====================================
//  Verificar ADMIN
// ====================================
exports.verificaAdmin = function (req, res, next) {

    const usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: {
                message: 'No es administrador'
            }
        });
    }
}





// ====================================
//  Verificar ADMIN o Mismo Usuario
// ====================================
exports.verificaAdmin_o_MismoUsuario = function (req, res, next) {

    const usuario = req.usuario;
    const id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: {
                message: 'No es administrador'
            }
        });
    }
}