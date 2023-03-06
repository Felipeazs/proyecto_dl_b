const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
    },
    apellidos: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    telefono: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    diagnosticos: [{
        type: mongoose.Types.ObjectId, required: false, ref: 'Diagnostico'
    }]

}, { timestamps: true })


module.exports = mongoose.model('Usuario', usuarioSchema)
