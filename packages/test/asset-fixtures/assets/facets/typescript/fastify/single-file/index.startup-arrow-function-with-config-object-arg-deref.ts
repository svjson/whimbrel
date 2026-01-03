import Fastify, { FastifyInstance } from 'fastify'

const startServer = (app: FastifyInstance, config: any) => {
  app.listen({ port: config.http.port, host: config.http.host })
}

const config = {
  http: {
    host: 'localhost',
    port: 8484,
  },
}

const app = Fastify()

startServer(app, config)
