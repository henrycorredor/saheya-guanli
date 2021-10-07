require('dotenv').config()
const MySqlClass = require('../lib/mysql')
const boom = require('@hapi/boom')
const bcrypt = require('bcrypt')

class UserServices {
    constructor() {
        this.db = new MySqlClass()
    }

    async getAllUsers() {
        const datos = await this.db.getData('usuarios')
        return datos
    }

    async createUser(data) {
        const result = await this.db.upsert('usuarios', data)
        return result
    }

    async getUser(id) {
        const user = await this.db.getData('usuarios', `usuario_id = ${id}`)
        return user
    }

    async editUser(id, data) {
        if (data.password) {
            const hashPassword = await bcrypt.hash(data.password, 8)
            delete data.password
            const actualPass = await this.db.getData('contrasenias', `id = ${id}`)
            if(actualPass.length>0){
                await this.db.upsert('contrasenias', { id: id, contrasenia: hashPassword }, `id = ${id}`)
            }else{
                await this.db.upsert('contrasenias', { id: id, contrasenia: hashPassword })
            }
        }
        if (data.length < 0) {
            const result = await this.db.upsert('usuarios', data, `usuario_id = ${id}`)
        }
        return true
    }

    async deleteUser(id) {
        const userInfo = await this.getUser(id)
        const result = await this.db.delete('usuarios', `usuario_id = ${id}`)
        return [userInfo, result]
    }

    async getUserLoans(id) {
        const data = await this.db.getData('prestamos', `deudor_id = ${id}`)
        return data
    }

    async getUserFreeCapital(num_identificacion) {
        const data = await this.db.getData('usuarios', `num_identificacion = ${num_identificacion}`, `capital, en_deuda`)
        if (data) {
            const { en_deuda, capital } = data[0]
            const capitalFree = (capital * Number(process.env.FREE_USER_CAPITAL_PERCENT)) / 100
            return capitalFree - en_deuda
        } else {
            throw boom.notFound('inexistent resource')
        }
    }

    async getUserPayments(user_id) {
        const data = await this.db.getData('transacciones', `usuario_id = ${user_id}`)
        if (data) {
            return data
        } else {
            throw boom.notFound('inexistent resource')
        }
    }
}

module.exports = UserServices