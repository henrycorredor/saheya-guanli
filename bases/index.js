const config = require('./backend/config_serv')
const publico = require('./backend/publico/pub-network')
const api = require('./backend/api/api-network')
const path = require('path')
const error = require('./backend/utiles/manejadorError')
const bodyParser = require('body-parser')

const express = require('express')
const aplicacion = express()

aplicacion.use(express.urlencoded({ extended: true }))
aplicacion.use(express.json())
aplicacion.use(bodyParser.json({ limit: "50mb" }))
aplicacion.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

aplicacion.set('views', path.join(__dirname, 'vistas'))
aplicacion.set('view engine', 'pug')

aplicacion.use('/', publico)
aplicacion.use('/api', api)
aplicacion.use(error)

aplicacion.listen(config.serv_puerto, function () {
    console.log(`Escuchando puerto ${config.serv_puerto}`)
})