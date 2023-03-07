const express = require('express')
const diagnostico_router = express.Router()
const { check } = require('express-validator')

const { getDiagnosticos, getDiagnostico } = require('./diagnosticos-controller')

diagnostico_router.get('/usuario/:id/diagnosticos', getDiagnosticos)
diagnostico_router.get('/usuario/:usuarioId/diagnostico/:diagnosticoId', getDiagnostico)


module.exports = diagnostico_router
