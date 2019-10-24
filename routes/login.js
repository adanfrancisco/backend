const express = require('express');
const mongo = require('mongodb').MongoClient;

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


var app = express();

var Usuario = require('../models/usuario');


app.post('/', (req, res) => {

    var body = req.body;


    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credeciales incorrectas - password',
                errors: err,
                pass1: body.password,
                pass2: usuarioDB.password
            });
        }

        // crear un token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });





        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    });

});



module.exports = app;