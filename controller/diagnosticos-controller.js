const mongoose = require('mongoose')
const Diagnostico = require('../db/models/diagnostico-model.js')

const auth_usuario = require('../utils/auth-usuario')

const getDiagnosticos = async (req, res, next) => {
    let decodedToken = auth_usuario(req)

    let diagnostico_encontrado
    try {
        diagnostico_encontrado = await Diagnostico.find({ usuario: decodedToken.usuarioId }).sort({ "createdAt": -1 })
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb'))
    }

    res.status(200).json({ diagnostico_encontrado })

}

const getDiagnostico = async (req, res, next) => {
    let decodedToken = auth_usuario(req)
    const { diagnosticoId } = req.params

    let diagnostico
    try {
        diagnostico = await Diagnostico.findById(diagnosticoId)
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb para encontrar el diagnóstico'))
    }

    if (!diagnostico) {
        throw new Error('El diagnóstico no se ha encontrado')
    }

    res.status(200).json({ diagnostico })
}

const deleteDiagnostico = async (req, res, next) => {
    let decodedToken = auth_usuario(req)
    const { diagnosticoId } = req.params

    let diagnostico
    try {
        diagnostico = await Diagnostico.findById(diagnosticoId).populate('usuario')

    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb para encontrar el diagnóstico'))
    }

    if (!diagnostico) {
        throw new Error('El diagnóstico no se ha encontrado')
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
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb para eliminar el diagnóstico', err.message))
    }

    res.status(200).json({ msg: 'resultado eliminado', resultado: resultado })
}

module.exports = { getDiagnosticos, getDiagnostico, deleteDiagnostico }
