<template>
    <div>
        <div class="controls">
            <div class="row">
                <label for="globeDiameter">Globe Diameter</label>
                <input v-model="controlSettings.globeDiameter" id="globeDiameter" type="range" min="1" max="170">
            </div>
            <div class="row">
                <label for="ringsCount">Rings Count</label>
                <input v-model="controlSettings.ringsCount" id="ringsCount" type="range" min="0" max="4">
            </div>
            <div class="row">
                <label for="ringsDiameter">Rings Diameter</label>
                <input v-model="controlSettings.ringsDiameter" id="ringsDiameter" type="range" min="0" max="20">
            </div>
            <div class="row">
                <label for="ringsDistance">Rings Distance</label>
                <input v-model="controlSettings.ringsDistance" id="ringsDistance" type="range" min="0" max="100">
            </div>
            <div class="row">
                <label for="ringsTilt">Rings Tilt</label>
                <input v-model="controlSettings.ringsTilt" id="ringsTilt" type="range" min="0.0" max="10.0" step="0.01">
            </div>
            <hr>
            <div class="row">
                <label for="pixelation">Pixelation</label>
                <input v-model="controlSettings.pixelation" id="pixelation" type="range" min="0.2" max="1.5" step="0.1">
            </div>
            <div class="row">
                <label for="rotationSpeed">Rotation Speed</label>
                <input v-model="controlSettings.rotationSpeed" id="rotationSpeed" type="range" min="1" max="15" step="0.5">
            </div>
            <div class="row">
                <label for="colorName">Color Name</label>
                <input v-model="controlSettings.colorName" id="colorName" type="range" min="0" :max="$colors.length - 1" step="1">
            </div>
            <div class="row">
                <label for="colorPadding">Color Padding</label>
                <input v-model="controlSettings.colorPadding" id="colorPadding" type="range" min="0" :max="($shades - ($shades % 2)) - 1" step="1">
            </div>
            <div class="row">
                <label for="contrast">Contrast</label>
                <input v-model="controlSettings.contrast" id="contrast" type="range" min="0.0" max="1.0" step="0.01">
            </div>
            <div class="row">
                <label for="colorPadding">High Contrast</label>
                <input v-model="controlSettings.useColor3" id="useColor3" type="checkbox">
            </div>
            <hr>
            <div class="row">
                <label for="globeTexture">Globe Texture</label>
                <select v-model="controlSettings.globeTexture" id="globeTexture">
                    <option value="mercury">Mercury</option>
                    <option value="venus">Venus</option>
                    <option value="earth">Earth</option>
                    <option value="moon">Moon</option>
                    <option value="mars">Mars</option>
                </select>
            </div>
            <hr>
            <div class="row center">
                <button type="button" :disabled="recordButtonDisabled" @click="recordGif">Record GIF</button>
                <p class="recordOutput">{{ recordOutput }}<span v-if="loadingIcon" class="loadingIcon"></span> <a v-show="dlReady" :href="dlGif" :download="dlName">Download GIF</a></p>
            </div>
        </div>
        <div class="controls controls__semi">
            <div class="row">
                <label for="modelType">Model Type</label>
                <input v-model="controlSettings.modelType" id="modelType" type="range" min="0" max="2" step="1">
            </div>
        </div>
        <div class="container container--controls">
            <p id="caststatus" class="big">
                {{ statusMessage }}
            </p>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import { mapActions, mapMutations, mapState } from 'vuex';

function getKey() {
    return (Math.floor(Math.random() * 2 ** 18).toString(36).padStart(4, 0)).toString();
};

export default Vue.extend({
    data() {
        return {
            recordButtonDisabled: false,
            recordStatus: {
                memory: 'You should scale down your browser window a bit, no one likes huge GIFs.',
                wait: 'Searching for loop start',
                record: 'Recording planet movement',
                render: 'Rendering frames',
                final: 'Finalizing output',
                done: 'Done!',
                error: 'Oops! Something broke, try again.',
                stop: 'GIF recording can\'t progress when rotation is paused.',
            },
            showMemoryNotice: window.innerWidth > 1000 || window.innerHeight > 1000,

            peer: null,
            connection: null,
            response: '',
            statusMessage: 'Connecting...',
            controlSettings: {},
            avoidChanges: false,
        };
    },
    watch: {
        controlSettings: {
            deep: true,
            handler(settings) {
                if (!this.avoidChanges) {
                    this.SET_OPTIONS(settings);
                    this.sendMessage({ settings });
                }
            },
        },
    },
    computed: {
        ...mapState(['settings']),
        dlReady: {
            ...mapState({ get: 'dlReady' }),
            ...mapMutations({ set: 'SET_DL_READY' }),
        },
        dlGif: {
            ...mapState({ get: 'dlGif' }),
            ...mapMutations({ set: 'SET_DL_GIF' }),
        },
        dlName: {
            ...mapState({ get: 'dlName' }),
            ...mapMutations({ set: 'SET_DL_NAME' }),
        },
        maxDimension () {
            return Math.max(window.innerWidth, window.innerHeight);
        },
        loadingIcon () {
            if (this.isStopped) {
                return false;
            }
            switch (this.currentRecordStatus) {
            case 'wait':
            case 'record':
            case 'render':
            case 'final':
                return true;
            }
            return false;
        },
        recordOutput () {
            if (this.isStopped) {
                return this.recordStatus.stop;
            }
            let output = '';
            let percentage = '';
            switch (this.currentRecordStatus) {
            case 'render':
                percentage = Math.floor(this.renderStatus * 100);
                output = `${this.recordStatus[this.currentRecordStatus]} (${percentage}%)`;
                break;
            case null:
                output = this.showMemoryNotice ? this.recordStatus.memory : '';
                break;
            case 'wait':
            case 'record':
            case 'final':
            case 'done':
            case 'error':
            case 'stop':
            case 'default':
                output = this.recordStatus[this.currentRecordStatus];
                break;
            }
            return output;
        },
        isStopped () {
            return this.stopMultiplicator === 0;
        },
    },
    methods: {
        ...mapMutations([
            'SET_COLOR_PRESET',
            'SET_USE_COLOR_3',
            'SET_DONUT_MODE',
            'SET_CURRENT_RECORD_STATUS',
            'SET_RENDER_STATUS',
            'SET_IS_RECORDING',
            'SET_IS_RECORDING_NOW',
            'SET_DL_READY',
            'SET_DL_GIF',
            'SET_DL_NAME',
            'SET_GIF_DATA',
        ]),
        ...mapActions([
            'SET_OPTIONS',
            'addMidiController',
        ]),
        onResize() {
            if (window.innerWidth > 1000 || window.innerHeight > 1000) {
                if (!this.currentRecordStatus) {
                    this.showMemoryNotice = true;
                }
            } else {
                if (this.currentRecordStatus !== 'memory') {
                    this.showMemoryNotice = false;
                }
            }
        },
        recordGif() {
            this.SET_DL_NAME('');
            this.SET_DL_GIF('');
            this.SET_DL_READY(false);
            this.recordButtonDisabled = true;
            this.SET_IS_RECORDING(true);
            this.SET_CURRENT_RECORD_STATUS('wait');
        },
        showCallContent() {
            this.statusMessage = '';
        },
        sendMessage(data = {}) {
            if (this.connection) {
                this.connection.send(data);
            }
        },
        connectPeers() {
            const url = new URL(window.location.href);
            const code = url.searchParams.get('k') ?? prompt('Please enter key code.');
            if (code) {
                this.connection = this.peer.connect(code);
                this.connection.on('open', () => {
                    this.connection.on('data', (data) => {
                        if ('settings' in data) {
                            this.SET_OPTIONS(data.settings);
                            this.controlSettings = data.settings;
                        }
                    });
                    this.connection.on('close', () => {
                        this.showCallContent();
                    });

                    this.statusMessage = `You're connected`;
                });
                this.connection.on('error', (error) => {
                    console.error('Error connecting: ', error);
                });
            }
        },
        call() {
            this.connectPeers();
        },
        recall() {
            this.connection = this.peer.reconnect();
            this.statusMessage = `You're connected`;
        },
        hangUp() {
            this.connection.close();
            this.showCallContent();
        },
        initPeer() {
            this.peer.on('open', () => {
                this.statusMessage = '';
                this.call();

                this.peer.on('close', () => {
                    this.showCallContent();
                });

                this.peer.on('disconnected', () => {
                    this.statusMessage = 'You are Disconnected. Please reload.';
                });
            });

            this.peer.on('error', (data) => {
                console.error(data);
            });
        }
    },
    async mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
            this.addMidiController();
        });

        const { peerjs } = await import('peerjs');

        this.peer = new peerjs.Peer(getKey(), {
            host: location.hostname,
            path: '/myapp',
            port: process.env.NODE_ENV !== 'production' ? 9001 : 9002,
            secure: process.env.NODE_ENV === 'production',
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

<style scoped>
    .loadingIcon {
        display: inline-block;
        height: 4px;
        width: 4px;
        margin-left: 5px;
        margin-right: -5px;
        border: none;
        background: hotpink;
        animation: blink-animation 1.2s steps(2, start) infinite;
    }
    hr {
        position: relative;
        height: 4px;
        width: 4px;
        margin: 20px auto;
        border: none;
        background: hotpink;
        overflow: visible;
    }
    hr::before {
        display: block;
        content: '';
        position: absolute;
        top: 0;
        height: 4px;
        width: 4px;
        left: -10px;
        background: hotpink;
    }
    hr::after {
        display: block;
        content: '';
        position: absolute;
        top: 0;
        height: 4px;
        width: 4px;
        right: -10px;
        background: hotpink;
    }
    .row {
        padding: 3px 0;
    }
    .center {
        text-align: center;
    }
    .donut {
        font-size: 2em;
        width: auto !important;
        text-align: right;
        padding-right: 5px;
    }
    .controls {
        z-index: 1;
    }
    a:link {
        color: white;
    }
    a:hover,
    a:focus,
    a:active {
        color: rgb(192, 192, 192);
    }
    button {
        -moz-appearance: none;
        -webkit-appearance: none;
        align-items: center;
        border: 1px solid transparent;
        border-radius: 5px;
        box-shadow: none;
        display: inline-block;
        justify-content: flex-start;
        padding: 10px 20px;
        position: relative;
        vertical-align: top;
        background: white;
        color: black;
        line-height: 1;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.3s;
        text-decoration: none;
    }
    button:hover {
        background: #eee;
    }
    button:active,
    button:focus {
        background: #ccc;
    }
    button[disabled],
    .button.disabled {
        opacity: 0.5;
        pointer-events: none;
    }
    .recordOutput {
        padding-bottom: 20px;
    }
    @keyframes blink-animation {
        to {
            visibility: hidden;
        }
    }
</style>
