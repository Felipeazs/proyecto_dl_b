const express = require('express')
const diagnostico_router= express.Router()
const { check } = require('express-validator')

const { getDiagnosticos } = require('./diagnosticos-controller')

diagnostico_router.get('/usuario/:id/diagnosticos', getDiagnosticos)


module.exports = diagnostico_router
