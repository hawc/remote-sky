import { defaults, textures } from 'assets/defaults';

const KNOB_OFFSET = 32;
const DEFAULTS_KEYS = Object.keys(defaults);

function getRandomNumber(data) {
    const min = Math.ceil(data.min);
    const max = Math.floor(data.max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
    return array[(Math.random() * array.length) | 0];
}

function getFromLocalStorage(key) {
    return typeof localStorage.remoteSkySettings !== 'undefined' ? JSON.parse(localStorage.remoteSkySettings)[key] : null;
}

function limitNumber(number, options) {
    return Math.floor((Math.min(Math.max(number / 127 * options.max, options.min), options.max)) * (1 / options.step)) / (1 / options.step);
}

export const state = () => ({
    settings: {
        globeDiameter: getFromLocalStorage('globeDiameter') ?? getRandomNumber(defaults.globeDiameter),
        ringsCount: getFromLocalStorage('ringsCount') ?? getRandomNumber(defaults.ringsCount),
        ringsDiameter: getFromLocalStorage('ringsDiameter') ?? getRandomNumber(defaults.ringsDiameter),
        ringsDistance: getFromLocalStorage('ringsDistance') ?? getRandomNumber(defaults.ringsDistance),
        ringsTilt: getFromLocalStorage('ringsTilt') ?? getRandomNumber(defaults.ringsTilt),
        globeTexture: getFromLocalStorage('globeTexture') ?? getRandomElement(defaults.globeTexture),
        contrast: getFromLocalStorage('contrast') ?? 0.35,
        pixelation: getFromLocalStorage('pixelation') ?? 1,
        rotationSpeed: getFromLocalStorage('rotationSpeed') ?? 2,
        colorPadding: getFromLocalStorage('colorPadding') ?? 0,
        colorName: getFromLocalStorage('colorName') ?? 0,
        modelType: getFromLocalStorage('modelType') ?? 1,
    },
    stopMultiplicator: getFromLocalStorage('stopMultiplicator') ?? 1,
    currentRecordStatus: null,
    renderStatus: null,
    isRecording: false,
    isRecordingNow: false,
    gifData: [],
    dlReady: false,
    dlGif: '#',
    dlName: '',
});

export const mutations = {
    SET_OPTION (state, payload) {
        const property = Object.keys(payload)[0];
        if (state.settings[property] !== payload[property]) {
            state.settings[property] = payload[property];
        }
    },
    SET_STOP_MULTIPLICATOR (state, payload) {
        state.stopMultiplicator = payload;
    },
    SET_CURRENT_RECORD_STATUS (state, payload) {
        state.currentRecordStatus = payload;
    },
    SET_RENDER_STATUS (state, payload) {
        state.renderStatus = payload;
    },
    SET_IS_RECORDING (state, payload) {
        state.isRecording = payload;
    },
    SET_IS_RECORDING_NOW (state, payload) {
        state.isRecordingNow = payload;
    },
    SET_GIF_DATA (state, payload) {
        state.gifData = payload;
    },
    SET_DL_READY (state, payload) {
        state.dlReady = payload;
    },
    SET_DL_GIF (state, payload) {
        state.dlGif = payload;
    },
    SET_DL_NAME (state, payload) {
        state.dlName = payload;
    },
    PUSH_GIF_DATA (state, payload) {
        state.gifData.push(payload);
    },
};

export const actions = {
    SET_OPTIONS({ commit }, payload) {
        const optionKeys = Object.keys(payload);
        optionKeys.forEach(optionKey => {
            let data = {};
            data[optionKey] = payload[optionKey];
            commit('SET_OPTION', data);
        });
        localStorage.remoteSkySettings = JSON.stringify(payload);
    },
    addMidiController (context) {
        const connect = () => {
            navigator.requestMIDIAccess()
                .then(
                    (midi) => midiReady(midi),
                    (err) => console.log('Something went wrong', err));
        };

        const midiReady = (midi) => {
            midi.addEventListener('statechange', (event) => initDevices(event.target));
            initDevices(midi);
        };
        const midiIn = [];

        const initDevices = (midi) => {
            const inputs = midi.inputs.values();
            for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
                midiIn.push(input.value);
            }

            startListening();
        };

        const midiMessageReceived = ({ data }) => {
            const knob = data['1'];
            const degree = data['2'];
            const commitData = {};
            const key = DEFAULTS_KEYS[knob - KNOB_OFFSET];
            commitData[key] = limitNumber(degree, defaults[key]);
            context.commit('SET_OPTION', commitData);
        };

        const startListening = () => {
            for (const input of midiIn) {
                input.addEventListener('midimessage', midiMessageReceived);
            }
        };

        connect();
    },
};