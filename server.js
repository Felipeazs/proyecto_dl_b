const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()

app.use(express.json())
app.use(cors())

const PORT = process.env.PORT
const connectMDB = require('./db/connection')

const usuario_router = require('./controller/usuario-router')

app.use('/api', usuario_router)

app.listen(PORT, async () => {
    console.log(`Servidor conectado al puerto ${PORT}`)

    await connectMDB()
})
