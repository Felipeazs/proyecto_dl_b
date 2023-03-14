const express = require('express')
const usuario_router = express.Router()
const { check } = require('express-validator')
const checkAuth = require('../middleware/check-auth')

const { getUsuario, loginUsuario, signupUsuario, actualizarUsuario, postDiagnostico } = require('./usuario-controller')

usuario_router.post('/login', [
    check('email').trim().normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 })
], loginUsuario)

usuario_router.post('/signup', [
    check('email').trim().normalizeEmail().isEmail(),
    check('password').isLength({ min: 8 }),
    check('password2').isLength({ min: 8 }).custom((value, { req }) => (value === req.body.password))
], signupUsuario)

//Diagnosticos
usuario_router.use(checkAuth)
usuario_router.put('/usuario', actualizarUsuario)
usuario_router.post('/usuario', postDiagnostico)
usuario_router.get('/usuario', getUsuario)

module.exports = usuario_router
