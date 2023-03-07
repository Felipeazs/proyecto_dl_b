const mongoose = require('mongoose')

const diagnosticoSchema = new mongoose.Schema({
    puntajeTotal: Number,
    porcentajeTotal: Number,
    nivelMadurez: String,
    respuestas: Object,
    usuario: { type: mongoose.Types.ObjectId, required: true, ref: 'Usuario' }
}, { timestamps: true })


module.exports = mongoose.model('Diagnostico', diagnosticoSchema)
