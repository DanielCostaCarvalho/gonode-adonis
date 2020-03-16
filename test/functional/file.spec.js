'use strict'

const { test, trait } = use('Test/Suite')('File')

const Helpers = use('Helpers')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('Retorna dados do arquivo ao fazer upload', async ({ assert, client }) => {
  const file = {
    name: 'test.jpg'
  }

  const response = await client.post('/files')
    .attach('file', Helpers.tmpPath(file.name))
    .end()

  response.assertStatus(200)
  assert.equal(response.body.name, file.name)
})

test('Retorna erro ao tentar fazer upload sem enviar o arquivo', async ({ client }) => {
  const response = await client.post('/files')
    .end()

  response.assertStatus(400)
  response.assertError({ error: { message: 'Arquivo não enviado' } })
})

test('Retorna sucesso ao buscar arquivos existentes', async ({ client }) => {
  const file = {
    name: 'test.jpg'
  }

  await client.post('/files')
    .attach('file', Helpers.tmpPath(file.name))
    .end()

  const response = await client.get('/files/1')
    .end()

  response.assertStatus(200)
})

test('Retorna erro ao tentar buscar arquivo inexistente', async ({ client }) => {
  const response = await client.get('/files/1')
    .end()

  response.assertStatus(404)
})
