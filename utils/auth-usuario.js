const jwt = require('jsonwebtoken')

const auth_usuario = (req) => {
    let decodedToken
    try {
        const istoken = req.headers.authorization.split(' ')[1]
        if (!istoken) {
            throw new Error('Falló la autenticactión')
        }

        decodedToken = jwt.verify(istoken, process.env.JWT_SECRET)
    } catch (err) {
        throw new Error('Falló la autenticactión')
    }

    return decodedToken
}

module.exports = auth_usuario
