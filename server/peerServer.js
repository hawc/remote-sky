import { PeerServer } from 'peer';

let ready = false;

function peerServer(server) {
    if (!ready) {
        const peerServer = PeerServer({
            host: 'localhost',
            debug: true,
            path: '/myapp',
            ssl: {},
            port: 9000,
        });
/*
        server.app.use(function (req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    */
        server.app.use(peerServer);

        console.log(peerServer, 'PeerServer started.');
    };
    ready = true;
    }

export {
    peerServer,
}