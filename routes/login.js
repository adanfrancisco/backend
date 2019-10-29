const express = require('express');
const mongo = require('mongodb').MongoClient;

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var app = express();
var Usuario = require('../models/usuario');


// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//==================================
// Autenticacion Google
//==================================
async function verify(token) {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
        // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const googleUser = ticket.getPayload();
    //const userid = googleUser['sub'];

    return {
        nombre: googleUser.name,
        email: googleUser.email,
        img: googleUser.picture,
        google: true
            //,
            //payload: payload
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'token no valido',
            });
        });


    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        // si da un error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar usuario',
                errors: err
            });
        }


        //Como no existe, lo guardo
        if (!usuarioDB) {

            var MiUsuario = new Usuario;
            MiUsuario.nombre = googleUser.nombre;
            MiUsuario.email = googleUser.email;
            MiUsuario.password = ':)';
            MiUsuario.img = googleUser.img;
            MiUsuario.google = true;
            MiUsuario.save();

            return res.status(200).json({
                ok: true,
                MiUsuario: MiUsuario,
                googleUser: googleUser,
                token: token,
                mensaje: 'usuario dado de alta'
            });
        } else {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Debe de usar su autenticacion normal'
                });

            } else {

                usuarioDB.password = ':)';

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Usuario encontrado',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });

            }





            //MiUsuario.save();

        }

        // if (usuarioDB) {
        //     if (usuarioDB.google === false) {
        //         return res.status(400).json({
        //             ok: true,
        //             mensaje: 'Debe de usar su autenticacion normal'
        //         });

        //     } else {

        //         usuario.password = ':)';

        //         var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

        //         return res.status(200).json({
        //             ok: true,
        //             usuario: usuario,
        //             token: token,
        //             id: usuario._id
        //         });

        //     }

        // } else {
        //     // si el usuario no existe

        //     var usuario = new Usuario();


        //     usuario.email = googleUser.email;
        //     usuario.password = ':)';
        //     usuario.img = googleUser.picture;
        //     usuario.nombre = googleUser.name;
        //     usuario.google = true;

        //     usuario.save((err, usuarioDB) => {

        //         var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

        //         return res.status(200).json({
        //             ok: true,
        //             usuario: usuarioDB,
        //             token: token,
        //             id: usuario._id
        //         });


        //     });
        // }


    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'okkkk',
    //     googleUser: googleUser
    // });


});







//==================================
// Autenticacion Normal
//==================================





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