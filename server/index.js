const express = require('express')
const app = express()

require('dotenv').config()

const port = process.env.SERVER_PORT || 5000

app.get('/', (req, res) => {
    res.send('base')
})

app.get('/:id', (req, res,) => {
    console.log('req: ', req)
    console.log('res: ', res)
    res.send('with id , ' +  req.params?.id.toString())
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
