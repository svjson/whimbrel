import Koa from 'koa'

const app = new Koa()

function start() {
  app.listen(4444)
}

start()
