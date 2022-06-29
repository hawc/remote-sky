<template>
    <div>
        <main>
            <Renderer ref="renderer" />
        </main>
        <div class="container">
            <p class="statusMessage">
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
import { mapActions, mapState } from 'vuex';
import QRCode from 'qrcode';
import Renderer from './Renderer.vue';

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
            connection: null,
        };
    },
    computed: {
        ...mapState(['settings']),
    },
    methods: {
        ...mapActions([
            'SET_OPTIONS',
        ]),
        initPeer() {
            this.generateQrCode(`https://${ location.hostname }/sender?k=${ this.key }`);

            this.peer.on('open', () => {
                this.statusMessage = `${ this.peer.id }`;

                this.peer.on('connection', (connection) => {
                    this.connection = connection;
                    connection.on('open', () => {
                        this.sendMessage({ settings: this.settings });
                    });
                    connection.on('data', (data) => {
                        if ('settings' in data) {
                            this.SET_OPTIONS(data.settings);
                        }
                    });
                });

                this.peer.on('close', () => {
                    console.log('closed');
                });
            });
        },
        sendMessage(data = {}) {
            if (this.connection) {
                this.connection.send(data);
            }
        },
        generateQrCode(text) {
            QRCode.toDataURL(text).then(image => this.qrcodeImage = image);
        },
    },
    async mounted() {
        const { peerjs } = await import('peerjs');

        const key = this.$getKey();
        this.key = key;

        this.peer = new peerjs.Peer(key, {
            host: location.hostname,
            path: '/myapp',
            port: process.env.NODE_ENV !== 'production' ? 443 : 9002, // using port 443 on prod because the nginx proxy redirects wss the traffic
            secure: process.env.NODE_ENV === 'production',
            debug: 3,
            config: {
                iceServers: [
                    {
                        urls: "turn:openrelay.metered.ca:80",
                        username: "openrelayproject",
                        credential: "openrelayproject",
                    },
                    {
                        urls: "turn:openrelay.metered.ca:443",
                        username: "openrelayproject",
                        credential: "openrelayproject",
                    },
                ],
            },
        });
    
        this.initPeer();
    },
});
</script>
