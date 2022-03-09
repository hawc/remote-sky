const express = require("express");
const http = require('http');
const app = express();
const { ExpressPeerServer } = require('peer');

const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
    proxied: true,
    debug: true,
    path: '/myapp',
    ssl: {},
    port: 9001,
});

app.use(peerServer);

console.log('Listening.');

export default {
    path: '/peerjs',
    handler: peerServer
}