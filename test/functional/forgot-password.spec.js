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

  await User.create(baseUser)

  Mail.fake()

  await client.post('/forgotpassword')
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
    error: { message: 'Email não encontrado' }
  })
})

test('Recuperar senha ao chamar rota de atualização', async ({ assert, client }) => {
  const baseUser = {
    username: 'teste',
    email: 'test@email',
    password: '123',
    token: 'correct_token',
    token_created_at: new Date()
  }

  await User.create(baseUser)

  const response = await client.put('/forgotpassword')
    .send({ token: baseUser.token, password: '321' })
    .end()

  response.assertStatus(200)
})

test('Retornar erro ao chamar rota de atualização com token inválido', async ({ assert, client }) => {
  const baseUser = {
    username: 'teste',
    email: 'test@email',
    password: '123',
    token: 'correct_token',
    token_created_at: new Date()
  }

  await User.create(baseUser)

  const response = await client.put('/forgotpassword')
    .send({ token: 'wrong_token', password: '321' })
    .end()

  response.assertError({ error: { message: 'Algo deu errado ao resetar sua senha' } })
})

test('Retornar erro ao chamar rota de atualização com token expirado', async ({ assert, client }) => {
  const baseUser = {
    username: 'teste',
    email: 'test@email',
    password: '123',
    token: 'correct_token',
    token_created_at: new Date('2019-12-30')
  }

  await User.create(baseUser)

  const response = await client.put('/forgotpassword')
    .send({ token: baseUser.token, password: '321' })
    .end()

  response.assertError({ error: { message: 'O token de recuperação está expirado' } })
})
