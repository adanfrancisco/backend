var express = require('express');
var app = express();
// var bcrypt = require('bcryptjs');

// var jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middleware/autenticacion');

var Medico = require('../models/medico');



// =====================================================================================================
//  Obtener Medico
// ====================================================================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(

            (err, medico) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medico: medico,
                        total: conteo
                    });
                })

            })


});






// =====================================================================================================
//  Actualizar un  medico
// ====================================================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el ido' + id + 'no existe',
                errors: { mensaje: 'no existe un medico con ese id' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar medico',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });


        });
    });
});





// =====================================================================================================
//  Crear un nuevo medico
// =====================================================================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            medico: medicoGuardado,

        });
    });



});


// =====================================================================================================
//  Borrar un medico por el id
// =====================================================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }
        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    })
});






module.exports = app;