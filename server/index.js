const express = require('express')
const app = express()
const expressWs = require('express-ws')(app);

require('dotenv').config()

const port = process.env.APP_SERVER_PORT || 5000

app.get('/', (req, res) => {
    res.send('base')
})

app.get('/:id', (req, res,) => {
    console.log('req: ', req)
    console.log('res: ', res)
    res.send('with id , ' +  req.params?.id.toString())
})
app.ws('/lexical/react-rich-collab', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
