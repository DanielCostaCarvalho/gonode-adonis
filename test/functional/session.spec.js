'use strict'

const { test, trait } = use('Test/Suite')('Session')

trait('Test/ApiClient')

const User = use('App/Models/User')

test('Retorna um token quando se autentica', async ({ assert, client }) => {
  const baseUser = {
    username: 'teste',
    email: 'test@email',
    password: '123'
  }

  await User.create(baseUser)

  const response = await client.post('/sessions')
    .send(baseUser)
    .end()

  response.assertStatus(200)
  assert.exists(response.body.token)
})
