const usersRouter = require('./router_users')
const loansRouter = require('./router_loans')

const swaggerUi = require('swagger-ui-express')
const swaggerDoc = require('../utils/documentation/swagger.json')

module.exports = function (app) {    
    app.use('/api/user', usersRouter)
    app.use('/api/loan', loansRouter)
    app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
}