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