import express from 'express'

const app = express()

app.listen(Number(process.env.PORT || 4321))
