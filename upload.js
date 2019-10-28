var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();
app.use(fileUpload());




app.put('/', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});


module.exports = app;