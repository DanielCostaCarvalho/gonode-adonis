'use strict'

const crypto = require('crypto')

const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store({ request, response }){
    const email = request.input('email')

    try {
      const user = await User.findByOrFail('email', email)
      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'],
        {token: user.token, email},
        message => {
          message
            .to()
            .from('teste@testoso.com', 'Email | Teste')
            .subject('Recuperar senha')
        }
      )
    } catch(err) {
      return response.status(err.status).send({
        error: 'Email não encontrado'
      })
    }

    return { sucess: true }
  }
}

module.exports = ForgotPasswordController
