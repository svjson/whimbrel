import Koa from 'koa'

const app = new Koa()

app.listen(process.env.PORT || 4433)
