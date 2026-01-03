import Fastify, { FastifyInstance } from 'fastify'

function startServer(app: FastifyInstance, port: number) {
  app.listen({ port, host: '0.0.0.0' })
}

const app = Fastify()

startServer(app, 8888)
