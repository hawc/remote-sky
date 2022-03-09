<template>
    <div>
        <div class="container">
            <h1>Send a message</h1>
            <p id="caststatus" class="big">
                {{ statusMessage }}
            </p>
            <button class="call-btn" type="button" @click.prevent="call" :hidden="callButtonHidden">
                Connect
            </button>
            <button class="recall-btn" type="button" @click.prevent="recall" :hidden="recallButtonHidden">
                Reconnect
            </button>
            <section class="call-container" :hidden="callContainerHidden">
                <button class="hangup-btn" type="button" @click.prevent="hangUp">
                    Hang up
                </button><br>
                <input ref="message" type="text">
                <button ref="sendMessage" type="button">Send</button><br>
            </section>
            <div v-html="response"></div>
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
    </div>
</template>

<script>
import Vue from 'vue';

function getKey() {
    return (Math.floor(Math.random() * 2 ** 18).toString(36).padStart(4, 0)).toString();
};

export default Vue.extend({
    data() {
        return {
            peer: null,
            connection: null,
            callContainerHidden: true,
            callButtonHidden: false,
            recallButtonHidden: true,
            response: '',
            statusMessage: 'Connecting...',
        };
    },
    methods: {
        showCallContent() {
            this.statusMessage = `Your device ID is: ${this.peer.id}`;
            this.callButtonHidden = false;
            this.callContainerHidden = true;
        },
        showReconnectContent() {
            this.statusMessage = `Your device ID is: ${this.peer.id}`;
            this.recallButtonHidden = false;
            this.callContainerHidden = true;
        },
        showConnectedContent() {
            this.statusMessage = `You're connected`;
            this.callButtonHidden = true;
            this.recallButtonHidden = true;
            this.callContainerHidden = false;
        },
        sendMessage() {
            this.connection.send(this.$refs.message.value);
        },
        connectPeers() {
            var url = new URL(window.location.href);
            var code = url.searchParams.get('k') ?? prompt('Please enter key code.');
            if (code) {
                this.connection = this.peer.connect(code);
                if (this.connection) {
                    console.log('connection');
                    console.log(this.connection);
                    this.connection.on('data', (data) => {
                        this.response = `${data}<br>${ this.response }`;
                    });
                    this.connection.on('close', () => {
                        this.showCallContent();
                    });
                    this.$refs.sendMessage.addEventListener('click', this.sendMessage);
                } else {
                    console.log('Error connecting.');
                }
            }
        },
        call() {
            this.connectPeers();
            this.showConnectedContent();
        },
        recall() {
            this.connection = this.peer.reconnect();
            this.showConnectedContent();
        },
        hangUp() {
            this.connection.close();
            this.$refs.sendMessage.removeEventListener('click', this.sendMessage);
            this.showCallContent();
        },
    },
    async mounted() {
        const { peerjs } = await import('peerjs');

        this.peer = new peerjs.Peer(getKey(), {
            host: location.hostname,
            debug: 3,
            path: '/myapp',
            port: process.env.NODE_ENV !== 'production' ? 9001 : 9002,
            secure: false,
        });

        this.peer.on('open', () => {
            this.statusMessage = `Your device ID is: ${ this.peer.id }`;
            this.peer.on('error', (data) => {
                console.error(data);
            });

            this.peer.on('close', () => {
                this.showCallContent();
            });

            this.peer.on('disconnected', () => {
                this.showReconnectContent();
            });
        });
    },
});
</script>
