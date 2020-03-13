'use strict'

const { test, trait } = use('Test/Suite')('ForgotPassword')

trait('Test/ApiClient')

const Mail = use('Mail')

const User = use('App/Models/User')

test('Cadastrar token ao chamar rota de senha esquecida', async ({ assert, client }) => {
  const baseUser = {
    username: 'teste2',
    email: 'test2@email',
    password: '123'
  }

  const user = await User.create(baseUser)

  Mail.fake()

  const response = await client.post('/forgotpassword')
    .send(baseUser)
    .end()

  response.assertStatus(200)
  assert.isNotNull(user.token)
})

test('Retornar erro ao chamar rota de senha esquecida com email inexistente', async ({ client }) => {
  const baseUser = {
    username: 'teste3',
    email: 'test3@email',
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
