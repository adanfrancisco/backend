var express = require('express');
var app = express();
// var bcrypt = require('bcryptjs');

// var jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middleware/autenticacion');

var Hospital = require('../models/hospital');



// =====================================================================================================
//  Obtener Hospitales
// ====================================================================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', ' nombre email')
        .exec(

            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }
                Hospital.collection.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });

                })
            })


});






// =====================================================================================================
//  Actualizar un  hospital
// ====================================================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el ido' + id + 'no existe',
                errors: { mensaje: 'no existe un hospital con ese id' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario;
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'error al actualizar hospital',
                    errors: err
                });
            }


            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });


        });
    });
});





// =====================================================================================================
//  Crear un nuevo hospital
// =====================================================================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,

        });
    });



});


// =====================================================================================================
//  Borrar un hospital por el id
// =====================================================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});






module.exports = app