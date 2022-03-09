const express = require("express");
const http = require('http');
const app = express();
const { ExpressPeerServer } = require('peer');

const server = app.listen(9001);

const peerServer = ExpressPeerServer(server, {
    proxied: true,
    debug: true,
    path: '/myapp',
    ssl: {},
});

app.use(peerServer);

console.log('Listening.');

export default {
    path: '/peerjs',
    handler: peerServer
}