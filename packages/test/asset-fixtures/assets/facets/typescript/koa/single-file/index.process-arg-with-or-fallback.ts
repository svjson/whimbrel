import Koa from 'koa'

const app = new Koa()

app.listen(process.argv[1] || 4444)
