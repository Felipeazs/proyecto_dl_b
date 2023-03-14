const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const HttpError = require('../middleware/http-error')

const Usuario = require('../db/models/usuario-model')
const Diagnostico = require('../db/models/diagnostico-model')

const getUsuario = async (req, res, next) => {

    const { usuarioId } = req.userData

    let usuario

    try {
        usuario = await Usuario.findById(usuarioId, '-password')
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    res.status(200).json(usuario)

}

const loginUsuario = async (req, res, next) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
        console.log({ errors: validationError.array() })
        return next(new HttpError('Los datos ingresados son inválidos', 422))
    }

    const { email, password } = req.body

    let usuario_identificado
    try {
        usuario_identificado = await Usuario.findOne({ email })
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    if (!usuario_identificado) {
        return next(new HttpError('El Usuario ingresado no existe', 404))
    }

    let is_password_valid = false
    try {
        is_password_valid = await bcrypt.compare(password, usuario_identificado.password)
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    if (!is_password_valid) {
        return next(new HttpError('Las credenciales ingresadas son inválidas', 403))
    }

    let token
    try {
        token = jwt.sign({
            usuarioId: usuario_identificado.id,
            email: usuario_identificado.email
        }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    const usuario = {
        usuarioId: usuario_identificado.id,
        nombre: usuario_identificado.nombre,
        apellidos: usuario_identificado.apellidos,
        email: usuario_identificado.email,
        telefono: usuario_identificado.telefono,
        timestamp: usuario_identificado.createdAt,
        token: token
    }

    res.status(200).json(usuario)
}

const signupUsuario = async (req, res, next) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
        console.log({ errors: validationError.array() })
        return next(new HttpError('Los datos ingresados son inválidos', 422))
    }

    const { email, password } = req.body

    try {
        const usuario_identificado = await Usuario.findOne({ email })
        if (usuario_identificado) {
            return next(new HttpError('El Usuario ingresado ya existe', 422))
        }
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    let hashed_password
    try {
        hashed_password = await bcrypt.hash(password, 12)
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    const nuevo_usuario = new Usuario({
        email: email,
        password: hashed_password
    })

    try {
        usuario_guardado = await nuevo_usuario.save()
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    let token
    try {
        token = jwt.sign({ usuarioId: usuario_guardado.id, email: usuario_guardado.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    const usuario = {
        usuarioId: usuario_guardado.id,
        nombre: usuario_guardado.nombre,
        apellidos: usuario_guardado.apellidos,
        email: usuario_guardado.email,
        telefono: usuario_guardado.telefono,
        timestamp: usuario_guardado.createdAt,
        token: token
    }

    res.status(201).json(usuario)

    return
}

const actualizarUsuario = async (req, res, next) => {
    const { nombre, apellidos, email, telefono } = req.body

    const { usuarioId } = req.userData

    let usuario
    try {
        usuario = await Usuario.findById(usuarioId, '-password')
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    if (!usuario) {
        return next(new HttpError('El usuario no existe', 404))
    }

    usuario.nombre = nombre
    usuario.apellidos = apellidos
    usuario.email = email
    usuario.telefono = telefono

    try {
        await usuario.save()
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    res.status(200).json({ msg: 'Usuario actualizado', usuario: usuario })
}

const postDiagnostico = async (req, res, next) => {
    const respuestas = req.body

    let { usuarioId } = req.userData

    let usuario
    try {
        usuario = await Usuario.findById(usuarioId)
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    if (!usuario) {
        return next(new HttpError('El usuario no existe', 404))
    }

    let nuevo_diagnostico = new Diagnostico({ ...respuestas, usuario: usuarioId })

    let resultado
    try {
        const sesion = await mongoose.startSession()
        sesion.startTransaction()
        result = await nuevo_diagnostico.save({ sesion })
        usuario.diagnosticos.push(nuevo_diagnostico)
        await usuario.save({ sesion })
        await sesion.commitTransaction()
    } catch (err) {
        console.log(err.message)
        return next(new HttpError('En este momento tenemos problemas con el servidor, por favor inténtalo más tarde', 500))
    }

    res.status(201).json({ results: resultado })
}

module.exports = { getUsuario, loginUsuario, signupUsuario, actualizarUsuario, postDiagnostico }
