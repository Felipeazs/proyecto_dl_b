const mongoose = require('mongoose')
const validator = require('mongoose-unique-validator')

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
    password: {
        type: String,
        required: true,
        minLength: 8
    }
}, { timestamps: true })


module.exports = mongoose.model('Usuario', usuarioSchema)
