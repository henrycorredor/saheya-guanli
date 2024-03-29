const express = require('express')
const router = express.Router()
const boom = require('@hapi/boom')

const validateSchema = require('../utils/middlewares/validation_handler')
const { createUser, userId, editUser, freePercent, godparents, editGodfather } = require('../utils/router_schemas/schema_user')

const scopes = require('../utils/middlewares/scopes_validation')

const Services = require('../services/serv_users')
const validation_handler = require('../utils/middlewares/validation_handler')
const services = new Services()

const passport = require('passport').authenticate('jwt', { session: false })

//list all users
router.get('/', passport, scopes(['2-super-user', '4-president']), async (req, res, next) => {
    try {
        const users = await services.getAllUsers()
        res.json({
            message: 'Listed all users',
            statusCode: '200',
            data: [...users]
        })
    } catch (error) {
        next(error)
    }
})

//get one user info
router.get('/:id', passport, scopes([['sefl'], '2-super-user', '4-president']), validateSchema(userId, 'params'), async (req, res, next) => {
    try {
        const { id } = req.params

        if (req.user.rol === '1-normal' && Number(id) !== Number(req.user.id)) throw boom.unauthorized()

        const user = await services.getUser(req.params.id)
        if (user) {
            res.json({
                message: 'User finded',
                statusCode: '200',
                data: user
            })
        } else {
            throw boom.notFound('Inexistent resource')
        }
    } catch (error) {
        next(error)
    }
})

// create user
router.post('/', passport, scopes(['2-super-user', '4-president']), validateSchema(createUser), async (req, res, next) => {
    try {
        const newUserData = await services.createUser(req.body)
        res.status(201).json({
            message: 'User created',
            statusCode: '201',
            data: newUserData
        })
    } catch (error) {
        next(error)
    }
})

//edit user info
router.put('/:id', passport, scopes([['self'], '2-super-user', '4-president']), validateSchema(editUser), async (req, res, next) => {
    try {
        const result = await services.editUser(req.params.id, req.body)
        if (result) {
            res.json({
                message: 'User edited',
                statusCode: '200',
                data: [{
                    id: req.params.id,
                    ...req.body
                }]
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

//get one user loans
router.get('/:id/loans', passport, scopes([['self']]), validateSchema(userId, 'params'), async (req, res, next) => {
    try {

        if (req.user.rol === '1-normal' && Number(id) !== Number(req.user.id)) throw boom.unauthorized()

        const data = await services.getUserLoans(req.params.id)
        if (data) {
            res.json({
                message: `User ${req.params.id} loans`,
                statusCode: '200',
                data: data
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

//get user free capital by document number
router.get('/:id_document_number/free_capital/:percent', passport, validateSchema(freePercent, 'params'), async (req, res, next) => {
    try {
        const { id_document_number, percent } = req.params
        const freeCapital = await services.getUserFreeCapital(id_document_number, percent)
        if (freeCapital || freeCapital === 0) {
            res.json({
                message: `User identified with number ${id_document_number} free capital`,
                statusCode: '200',
                data: freeCapital
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

//list payments done by user
router.get('/:id/payments', passport, scopes([['self'], '2-super-user', '3-treasurer', '4-president', '5-fiscal']), validateSchema(userId, 'params'), async (req, res, next) => {
    try {
        const payments = await services.getUserPayments(req.params.id)
        res.json({
            message: `User ${req.params.id} payments list`,
            statusCode: '200',
            data: payments
        })
    } catch (err) {
        next(err)
    }
})

router.post(`/godparent/:gp/godson/:gs`,
    passport,
    scopes(['2-super-user', '4-president']),
    validateSchema(godparents, 'params'),
    async (req, res, next) => {
        try {
            const setGP = await services.setGodParents(req.params.gp, req.params.gs)
            res.json({
                message: `User ${req.params.gp} is godfather of ${req.params.gs}`,
                statusCode: '201',
                data: setGP
            })
        } catch (err) {
            next(err)
        }
    })

router.put(`/godparent/:id`,
    passport,
    scopes(['2-super-user', '4-president']),
    validateSchema(userId, 'params'),
    validateSchema(editGodfather),
    async (req, res, next) => {
    try {
        const setGP = await services.updateGodParents(req.params.id, req.body.status)
        res.json({
            message: `User ${req.params.gp} is godfather of ${req.params.gs}`,
            statusCode: '200',
            data: setGP
        })
    } catch (err) {
        next(err)
    }
})

module.exports = router