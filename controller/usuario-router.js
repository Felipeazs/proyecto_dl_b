const express = require('express')
const usuario_router = express.Router()
const { check } = require('express-validator')

const { getUsuario, loginUsuario, signupUsuario, actualizarUsuario, postDiagnostico } = require('./usuario-controller')

usuario_router.get('/usuario/:id', getUsuario)

usuario_router.post('/login', [
    check('email').trim().normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 })
], loginUsuario)

usuario_router.post('/signup', [
    check('email').trim().normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 }),
    check('password2').isLength({ min: 8 }).custom((value, { req }) => (value === req.body.password))
], signupUsuario)
usuario_router.put('/usuario/:id', actualizarUsuario)

//Diagnosticos
usuario_router.post('/usuario/:id', postDiagnostico)

module.exports = usuario_router
