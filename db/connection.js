const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false)

const connectMDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
        .then(res => console.log('conectado a la base de datos de', res.connection.name))
        .catch(err => console.log(err.reason))
}

module.exports = connectMDB
