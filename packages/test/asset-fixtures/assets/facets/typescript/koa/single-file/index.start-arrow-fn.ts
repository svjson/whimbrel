import Koa from 'koa'

const app = new Koa()

const start = () => {
  app.listen(4444)
}

start()
