'use strict'

const crypto = require('crypto')
const moment = require('moment')

const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    const { email } = request.only(['email'])

    try {
      const user = await User.findByOrFail('email', email)
      user.token = await crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'],
        { token: user.token, email },
        message => {
          message
            .to(email)
            .from('teste@testoso.com', 'Email | Teste')
            .subject('Recuperar senha')
        }
      )

      return { sucess: true }
    } catch (err) {
      return response.status(err.status).send({
        error: { message: 'Email não encontrado' }
      })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.only(['token', 'password'])
      const user = await User.findByOrFail('token', token)

      const tokenExpired = moment()
        .subtract('2', 'days')
        .isAfter(user.token_created_at)

      if (tokenExpired) {
        return response
          .status(401)
          .send({ error: { message: 'O token de recuperação está expirado' } })
      }

      user.token = null
      user.token_created_at = null
      user.password = password

      await user.save()

      return { sucess: true }
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Algo deu errado ao resetar sua senha' } })
    }
  }
}

module.exports = ForgotPasswordController
