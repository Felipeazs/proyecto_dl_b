const express = require('express')
const diagnostico_router = express.Router()
const checkAuth = require('../middleware/check-auth')

const { getDiagnosticos, getDiagnostico, deleteDiagnostico } = require('./diagnosticos-controller')

diagnostico_router.use(checkAuth)
diagnostico_router.get('/usuario/diagnosticos', getDiagnosticos)
diagnostico_router.get('/usuario/diagnostico/:diagnosticoId', getDiagnostico)
diagnostico_router.delete('/usuario/diagnostico/:diagnosticoId', deleteDiagnostico)


module.exports = diagnostico_router
