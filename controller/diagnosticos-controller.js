const mongoose = require('mongoose')
const HttpError = require('../middleware/http-error')
const Diagnostico = require('../db/models/diagnostico-model.js')
const Usuario = require('../db/models/usuario-model')

const getDiagnosticos = async (req, res, next) => {

    const { usuarioId } = req.userData

    let diagnostico_encontrado
    try {
        diagnostico_encontrado = await Diagnostico.find({ usuario: usuarioId }).sort({ "createdAt": -1 })
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('Problemas con mongodb para encontrar el diagnóstico', 500))
    }

    res.status(200).json({ diagnostico_encontrado })

}

const getDiagnostico = async (req, res, next) => {

    const { diagnosticoId } = req.params

    const { usuarioId } = req.userData
    let usuario
    try {
        usuario = await Usuario.findById(usuarioId)
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('Problemas con mongodb para encontrar el diagnóstico', 500))
    }

    if (!usuario) {
        return next(new HttpError('El usuario no se ha encontrado', 404))
    }

    let diagnostico
    try {
        diagnostico = await Diagnostico.findById(diagnosticoId)
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('Problemas con mongodb para encontrar el diagnóstico', 500))
    }

    if (!diagnostico) {
        throw new HttpError('El diagnóstico no se ha encontrado', 404)
    }

    res.status(200).json({ diagnostico })
}

const deleteDiagnostico = async (req, res, next) => {

    const { diagnosticoId } = req.params
    const { usuarioId } = req.userData

    let usuario
    try {
        usuario = await Usuario.findById(usuarioId)
    } catch (err) {
        return next(new HttpError('Problemas con mongodb para encontrar el usuario', 500))
    }

    if (!usuario) {
        return next(new HttpError('El usuario no se ha encontrado', 404))
    }

    let diagnostico
    try {
        diagnostico = await Diagnostico.findById(diagnosticoId).populate('usuario')
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('Problemas con mongodb para encontrar el diagnóstico', 500))
    }

    if (!diagnostico) {
        return next(new HttpError('El diagnóstico no se ha encontrado', 404))
    }

    let resultado
    try {
        const sesion = await mongoose.startSession()
        sesion.startTransaction()
        resultado = await diagnostico.deleteOne({ sesion })
        diagnostico.usuario.diagnosticos.pull(diagnostico)
        await diagnostico.usuario.save({ sesion })
        await sesion.commitTransaction()
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('Problemas con mongodb para encontrar el diagnóstico', 500))
    }

    res.status(200).json({ msg: 'diagnostico eliminado', resultado: resultado })
}

module.exports = { getDiagnosticos, getDiagnostico, deleteDiagnostico }
