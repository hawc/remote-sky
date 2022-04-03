
import colorscale from 'colormap/colorScale';

const colors = Object.keys(colorscale);
const shades = 40;

const defaults = {
    globeDiameter: {
        min: 1,
        max: 170,
    },
    ringsCount: {
        min: 0,
        max: 4,
    },
    ringsDiameter: {
        min: 1,
        max: 20,
    },
    ringsDistance: {
        min: 0,
        max: 100,
    },
    ringsTilt: {
        min: 0.0,
        max: 10.0,
    },
    contrast: {
        min: 0.0,
        max: 1.0,
    },
    pixelation: {
        min: 0.2,
        max: 1.5,
    },
    rotationSpeed: {
        min: 1,
        max: 15,
    },
    colorName: {
        min: 0,
        max: colors.length - 1,
    },
    colorPadding: {
        min: 0,
        max: (shades - (shades % 2)) - 1,
    },
    modelType: {
        min: 0,
        max: 3,
    },
    texturePresets: [
        'mercury',
        'venus',
        'earth',
        'moon',
        'mars',
    ],
};

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

export const state = () => ({
    settings: {
        globeDiameter: getFromLocalStorage('globeDiameter') ?? getRandomNumber(defaults.globeDiameter),
        ringsCount: getFromLocalStorage('ringsCount') ?? getRandomNumber(defaults.ringsCount),
        ringsDiameter: getFromLocalStorage('ringsDiameter') ?? getRandomNumber(defaults.ringsDiameter),
        ringsDistance: getFromLocalStorage('ringsDistance') ?? getRandomNumber(defaults.ringsDistance),
        ringsTilt: getFromLocalStorage('ringsTilt') ?? getRandomNumber(defaults.ringsTilt),
        globeTexture: getFromLocalStorage('globeTexture') ?? getRandomElement(defaults.texturePresets),
        useColor3: getFromLocalStorage('useColor3') ? JSON.parse(getFromLocalStorage('useColor3')) : false,
        contrast: getFromLocalStorage('contrast') ?? 0.35,
        pixelation: getFromLocalStorage('pixelation') ?? 1,
        rotationSpeed: getFromLocalStorage('rotationSpeed') ?? 2,
        colorPadding: getFromLocalStorage('colorPadding') ?? 0,
        colorName: getFromLocalStorage('colorName') ?? 0,
        modelType: getFromLocalStorage('modelType') ? JSON.parse(getFromLocalStorage('modelType')) : false,
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
        state.settings[property] = payload[property];
    },
    SET_GLOBE_TEXTURE (state, payload) {
        state.globeTexture = payload;
        localStorage.globeTexture = payload;
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
            // Also react to device changes.
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
            const knobMapping = {
                32: 'globeDiameter',
                33: 'ringsCount',
                34: 'ringsDiameter',
                35: 'ringsDistance',
                36: 'ringsTilt',
                37: 'pixelation',
                38: 'rotationSpeed',
                39: 'colorName',
                40: 'colorPadding',
                41: 'contrast',
                47: 'modelType',
            };
            const knob = data['1'];
            const degree = data['2'];
            const commitData = {};
            const key = knobMapping[knob];
            console.log(degree, knob, defaults[knobMapping[knob]]);
            commitData[key] = limitNumber(degree, defaults[knobMapping[knob]]);
            context.commit('SET_OPTION', commitData);
        };

        // Start listening to MIDI messages.
        const startListening = () => {
            for (const input of midiIn) {
                input.addEventListener('midimessage', midiMessageReceived);
            }
        };

        const limitNumber = (number, options) => {
            return Math.floor(Math.min(Math.max(number / 127 * options.max, options.min), options.max));
        };

        connect();
    },
};
