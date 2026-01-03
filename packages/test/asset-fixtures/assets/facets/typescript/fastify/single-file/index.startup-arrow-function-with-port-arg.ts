import Fastify, { FastifyInstance } from 'fastify'

const startServer = (app: FastifyInstance, port: number) => {
  app.listen({ port, host: '0.0.0.0' })
}

const app = Fastify()

startServer(app, 8888)
