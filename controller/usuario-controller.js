const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const auth_usuario = require('../utils/auth-usuario')

const Usuario = require('../db/models/usuario-model')
const Diagnostico = require('../db/models/diagnostico-model')

const getUsuario = async (req, res, next) => {

    let decodedToken = auth_usuario(req)

    let usuario

    try {
        usuario = await Usuario.findById(decodedToken.usuarioId, '-password')
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb'))
    }

    res.status(200).json(usuario)

}

const loginUsuario = async (req, res, next) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
        console.log({ errors: validationError.array() })
        return res.status(400).json({ error: '400' })
    }

    const { email, password } = req.body

    let usuario_identificado
    try {
        usuario_identificado = await Usuario.findOne({ email })
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb'))
    }

    if (!usuario_identificado) {
        res.status(404).json({ error: '404' })
        return next(new Error('Usuario no encontrado'))
    }

    let is_password_valid = false
    try {
        is_password_valid = await bcrypt.compare(password, usuario_identificado.password)
    } catch (err) {
        return next(new Error('Problemas con bcrypt'))
    }

    if (!is_password_valid) {
        res.status(403).json({ error: '403' })
        return next(new Error('Credenciales inválidas'))
    }

    let token
    try {
        token = jwt.sign({
            usuarioId: usuario_identificado.id,
            email: usuario_identificado.email
        }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (err) {
        return next(new Error('Problemas con jwt'))
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
        return res.status(400).json({ error: '400' })
    }

    const { email, password } = req.body

    try {
        const usuario_identificado = await Usuario.findOne({ email })
        if (usuario_identificado) {
            return res.status(302).json({ error: '302' })
        }
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb'))
    }

    let hashed_password
    try {
        hashed_password = await bcrypt.hash(password, 12)
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con bcrypt'))
    }

    const nuevo_usuario = new Usuario({
        email: email,
        password: hashed_password
    })

    try {
        usuario_guardado = await nuevo_usuario.save()
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb'))
    }

    let token
    try {
        token = jwt.sign({ usuarioId: usuario_guardado.id, email: usuario_guardado.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con jwt'))
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

    let decodedToken = auth_usuario(req)

    let usuario
    try {
        usuario = await Usuario.findOne({ id: decodedToken.id }, '-password')
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb'))
    }

    if (!usuario) {
        res.status(400).json({ error: '400' })
        return next(new Error('El usuario no existe'))
    }

    usuario.nombre = nombre
    usuario.apellidos = apellidos
    usuario.email = email
    usuario.telefono = telefono

    try {
        await usuario.save()
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb'))
    }

    res.status(200).json({ msg: 'usuario actualizado', usuario: usuario })
}

const postDiagnostico = async (req, res, next) => {
    const respuestas = req.body

    let { usuarioId } = auth_usuario(req)

    let usuario
    try {
        usuario = await Usuario.findById(usuarioId)
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas Encontrando al usuario en mongodb'))
    }

    if (!usuario) return

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
        return next(new Error('Problemas guardando el diagnostico en mongodb', err))
    }

    res.status(201).json({ results: resultado })
}

module.exports = { getUsuario, loginUsuario, signupUsuario, actualizarUsuario, postDiagnostico }
