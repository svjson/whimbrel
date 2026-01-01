import Koa from 'koa'

function start() {
  const app = new Koa()
  app.listen(4444)
}

start()
