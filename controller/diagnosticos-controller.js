const Diagnostico = require('../db/models/diagnostico-model.js')

const auth_usuario = require('../utils/auth-usuario')

const getDiagnosticos = async (req, res, next) => {

    let decodedToken = auth_usuario(req)

    let diagnostico_encontrado
    try {
        diagnostico_encontrado = await Diagnostico.find({ usuario: decodedToken.usuarioId })
    } catch (err) {
        res.status(500).json({ error: '500' })
        return next(new Error('Problemas con mongodb'))
    }

    res.status(200).json({ diagnostico_encontrado })

}

module.exports = { getDiagnosticos }
