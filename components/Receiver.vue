<template>
    <div>
        <div class="container">
            <h1>Get messages</h1>
            <p class="big">
                {{ statusMessage }}
            </p>
            <section class="call-container">
                <div v-html="response"></div>
            </section>
        </div>
        <section class="modal" hidden>
            <div id="close">
                close
            </div>
            <div class="inner-modal">
                <label>Give us your friend's device ID</label>
                <input placeholder="Enter your friend's device ID" aria-colcount="10">
                <button class="connect-btn">
                    Connect
                </button>
            </div>
        </section>
        <div>
            <img v-if="qrcodeImage" :src="qrcodeImage" />
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import QRCode from 'qrcode';

function getKey() {
    return (Math.floor(Math.random() * 2 ** 18).toString(36).padStart(4, 0)).toString();
}

export default Vue.extend({
    data() {
        return {
            peer: null,
            response: '',
            statusMessage: 'Connecting...',
            key: '',
            qrcodeImage: '',
        };
    },
    methods: {
        init() {
            this.generateQrCode(`https://${ location.hostname }/sender?k=${ this.key }`);

            this.peer.on('open', () => {
                this.statusMessage = `Your device ID is: ${ this.peer.id }`;

                this.peer.on('connection', (connection) => {
                    connection.on('open', () => {
                        // here we can pass default settings to the user.
                        connection.send('Connection established.');
                    });
                    connection.on('data', (data) => {
                        this.response = `${ data }<br>${ this.response }`;
                    });
                });

                this.peer.on('close', () => {
                    console.log('closed');
                });
            });
        },
        generateQrCode(text) {
            QRCode.toDataURL(text).then(image => this.qrcodeImage = image);
        },
    },
    async mounted() {
        const { peerjs } = await import('peerjs');

        let key = getKey();
        this.key = key;

        this.peer = new peerjs.Peer(key, {
            host: location.hostname,
            debug: 3,
            path: '/myapp',
            port: process.env.NODE_ENV !== 'production' ? 9001 : 9002,
            secure: false,
        });
    
        this.init();
    },
});
</script>
