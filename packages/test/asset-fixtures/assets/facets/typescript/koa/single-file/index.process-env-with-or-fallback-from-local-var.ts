import Koa from 'koa'

const app = new Koa()

const port = process.env.PORT || 4433
app.listen(port)
