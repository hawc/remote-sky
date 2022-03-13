<template>
    <div>
        <main>
            <Renderer ref="renderer" />
        </main>
        <div class="container">
            <p class="big">
                {{ statusMessage }}
            </p>
            <section class="call-container">
                <div v-html="response"></div>
            </section>
            <img v-if="qrcodeImage" :src="qrcodeImage" alt="QR Code" />
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import QRCode from 'qrcode';
import Renderer from './Renderer.vue';

function getKey() {
    return (Math.floor(Math.random() * 2 ** 18).toString(36).padStart(4, 0)).toString();
}

export default Vue.extend({
    components: { 
        Renderer,
    },
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
        initPeer() {
            this.generateQrCode(`https://${ location.hostname }/sender?k=${ this.key }`);

            this.peer.on('open', () => {
                this.statusMessage = `Your device ID is: ${ this.peer.id }`;

                this.peer.on('connection', (connection) => {
                    connection.on('open', () => {
                        // here we can pass default settings to the user.
                        connection.send('Connection established.');
                    });
                    connection.on('data', (data) => {
                        if ('status' in data) {
                            this.response = `${ data.status }<br>${ this.response }`;
                        } else if ('settings' in data) {
                            this.$refs.renderer.SET_OPTIONS(data.settings);
                        }
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

        const key = getKey();
        this.key = key;

        this.peer = new peerjs.Peer(key, {
            host: location.hostname,
            path: '/myapp',
            port: process.env.NODE_ENV !== 'production' ? 9001 : 9002,
            secure: process.env.NODE_ENV === 'production',
        });
    
        this.initPeer();
    },
});
</script>
