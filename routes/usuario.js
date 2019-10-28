	var express = require('express');
	var app = express();
	var bcrypt = require('bcryptjs');

	var jwt = require('jsonwebtoken');
	// var SEED = require('../config/config').SEED;

	var mdAutenticacion = require('../middleware/autenticacion');

	var Usuario = require('../models/usuario');



	// =====================================================================================================
	//  Obtener Usuarios
	// ====================================================================================================

	app.get('/', (req, res, next) => {

	    var desde = req.query.desde || 0;
	    desde = Number(desde);

	    Usuario.find({}, 'nombre email img role')
	        .skip(desde)
	        .limit(5)
	        .exec(

	            (err, usuarios) => {

	                if (err) {
	                    return res.status(500).json({
	                        ok: false,
	                        mensaje: 'Error cargando usuario',
	                        errors: err
	                    });
	                }

	                Usuario.collection.count({}, (err, conteo) => {
	                    res.status(200).json({
	                        ok: true,
	                        usuarios: usuarios,
	                        total: conteo
	                    });
	                })

	            })


	});






	// =====================================================================================================
	//  Actualizar un  usuario
	// ====================================================================================================
	app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

	    var id = req.params.id;
	    var body = req.body;

	    Usuario.findById(id, (err, usuario) => {
	        if (err) {
	            return res.status(500).json({
	                ok: false,
	                mensaje: 'error al buscar usuario',
	                errors: err
	            });
	        }
	        if (!usuario) {
	            return res.status(400).json({
	                ok: false,
	                mensaje: 'El usuario con el ido' + id + 'no existe',
	                errors: { mensaje: 'no existe un usuario con ese id' }
	            });
	        }
	        usuario.nombre = body.nombre;
	        usuario.email = body.email;
	        usuario.role = body.role;

	        usuario.save((err, usuarioGuardado) => {
	            if (err) {
	                return res.status(400).json({
	                    ok: false,
	                    mensaje: 'error al actualizar usuario',
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





	// =====================================================================================================
	//  Crear un nuevo usuario
	// =====================================================================================================

	app.post('/', mdAutenticacion.verificaToken, (req, res) => {
	    var body = req.body;

	    var usuario = new Usuario({
	        nombre: body.nombre,
	        email: body.email,
	        password: bcrypt.hashSync(body.password, 10),
	        img: body.img,
	        role: body.role
	    });

	    usuario.save((err, usuarioGuardado) => {
	        if (err) {
	            return res.status(400).json({
	                ok: false,
	                mensaje: 'Error al crear usuario',
	                errors: err
	            });
	        }
	        return res.status(201).json({
	            ok: true,
	            usuario: usuarioGuardado,
	            usuarioToken: req.usuario
	        });
	    });



	});


	// =====================================================================================================
	//  Borrar Usuario
	// =====================================================================================================
	app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
	    var id = req.params.id;

	    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
	        if (err) {
	            return res.status(500).json({
	                ok: false,
	                mensaje: 'Error al Borrar usuario',
	                errors: err
	            });
	        }
	        if (!usuarioBorrado) {
	            return res.status(500).json({
	                ok: false,
	                mensaje: 'No existe un usuario con ese id',
	                errors: { message: 'No existe un usuario con ese id' }
	            });
	        }
	        return res.status(200).json({
	            ok: true,
	            usuario: usuarioBorrado
	        });
	    })
	});






	module.exports = app;