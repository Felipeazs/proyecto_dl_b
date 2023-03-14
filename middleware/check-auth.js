require('dotenv').config()
const jwt = require('jsonwebtoken');
const HttpError = require('../middleware/http-error');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authentication failed');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { usuarioId: decodedToken.usuarioId };

        console.log(req.userData)
        next();

    } catch (error) {
        return next(new HttpError('Authentication failed', 403));
    }
};

