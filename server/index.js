const express = require('express')
const app = express()
const WebSocket = require('ws')
const {setupWSConnection} = require('y-websocket/bin/utils')
const Y = require('yjs')

require('dotenv').config({path: '..'})

const port = process.env.APP_SERVER_PORT || 5004

app.get('/', (req, res) => {
    res.send('base')
})

app.get('/:id', (req, res,) => {
    console.log('req: ', req)
    console.log('res: ', res)
    res.send('with id , ' + req.params?.id.toString())
})

const server = app.listen(port, '192.168.1.8', () => {
    console.log(`Example app listening on port ${port}`)
})


const wss = new WebSocket.Server({server})

// Веб-сокет обработчик

wss.on('connection', function (ws, req) {
    // console.log("req: ", req)
    // ws.on('message', function (msg) {
    //     console.log(msg);
    // });

    const params = new URLSearchParams(req.url.replace('/', ''))
    const docName = params.get('room') || 'default'
    console.log('req.url: ', req.url)
    console.log('params: ', params)
    console.log('docName: ', docName)
    // Загружаем или создаем новый документ
    const doc = new Y.Doc()

    setupWSConnection(ws, req, doc, {gc: true})

    console.log(`Подключение установлено к документу: ${docName}`)

    ws.on('close', () => {
        console.log(`Подключение к документу ${docName} закрыто`)
    })
});
