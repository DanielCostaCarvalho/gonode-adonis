'use strict'

const { test, trait } = use('Test/Suite')('ForgotPassword')

trait('Test/ApiClient')
trait('DatabaseTransactions')

const Mail = use('Mail')

const User = use('App/Models/User')

test('Cadastrar token ao chamar rota de senha esquecida', async ({ assert, client }) => {
  const baseUser = {
    username: 'teste',
    email: 'test@email',
    password: '123'
  }

  const user = await User.create(baseUser)

  Mail.fake()

  const response = await client.post('/forgotpassword')
    .send(baseUser)
    .end()

  response.assertStatus(200)
  assert.isNotNull(user.token)

  Mail.restore()
})

test('Enviar email ao chamar rota de senha esquecida', async ({ assert, client }) => {
  const baseUser = {
    username: 'teste',
    email: 'test@email',
    password: '123'
  }

  const user = await User.create(baseUser)

  Mail.fake()

  const response = await client.post('/forgotpassword')
    .send(baseUser)
    .end()

  const recentEmail = Mail.pullRecent()

  assert.include(recentEmail.envelope.to, baseUser.email)

  Mail.restore()
})

test('Retornar erro ao chamar rota de senha esquecida com email inexistente', async ({ client }) => {
  const baseUser = {
    username: 'teste',
    email: 'test@email',
    password: '123'
  }

  await User.create(baseUser)

  const response = await client.post('/forgotpassword')
    .send({ email: 'falso@mail' })
    .end()

  response.assertError({
    error: 'Email não encontrado'
  })
})
