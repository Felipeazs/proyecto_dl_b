const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const Usuario = require('../db/models/usuario-model')

const getUsuario = (req, res, next) => {
    const { id } = req.params
    console.log('obtener usuario', id)

    const istoken = req.headers.authorization.split(' ')[1]
    console.log(istoken)
}

const loginUsuario = async (req, res, next) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
        console.log({ errors: validationError.array() })
        return res.status(400).json({ error: true })
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
        return next(new Error('Usuario no encontrado'))
    }

    let is_password_valid = false
    try {
        is_password_valid = await bcrypt.compare(password, usuario_identificado.password)
    } catch (err) {
        return next(new Error('Problemas con bcrypt'))
    }

    if (!is_password_valid) {
        return next(new Error('Credenciales inválidas'))
    }

    let token
    try {
        token = jwt.sign({
            usuarioId: usuario_identificado.id, email: usuario_identificado.email
        }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (err) {
        return next(new Error('Problemas con jwt'))
    }

    res.status(200).json({ usuarioId: usuario_identificado.id, email: usuario_identificado.email, token: token })
}

const signupUsuario = async (req, res, next) => {
    const validationError = validationResult(req)
    if (!validationError.isEmpty()) {
        console.log({ errors: validationError.array() })
        return res.status(400).json({ error: true })
    }

    const { email, password } = req.body

    let hashed_password
    try {
        hashed_password = await bcrypt.hash(password, 12)
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con bcrypt'))
    }

    const nuevo_usuario = new Usuario({
        nombre: '',
        apellidos: '',
        email: email,
        password: hashed_password
    })

    try {
        usuario_guardado = await nuevo_usuario.save()
    } catch (err) {
        res.status(400).json({ error: 400 })
        return next(new Error('Problemas con mongodb'))
    }

    let token
    try {
        token = jwt.sign({ usuarioId: usuario_guardado.id, email: usuario_guardado.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (err) {
        return next(new Error('Problemas con jwt'))
    }

    res.status(201).json({ usuarioId: usuario_guardado.id, email: usuario_guardado.email, token: token })

    return

}

module.exports = { getUsuario, loginUsuario, signupUsuario }
