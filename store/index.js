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
        max: 50,
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
        min: 2,
        max: 20,
    },
    texturePresets: [
        'mercury',
        'venus',
        'earth',
        'moon',
        'mars',
    ],
};

function getRandomNumber (data) {
    const min = Math.ceil(data.min);
    const max = Math.floor(data.max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomElement (array) {
    return array[(Math.random() * array.length) | 0];
}

export const state = () => ({
    globeDiameter: localStorage.globeDiameter ?? getRandomNumber(defaults.globeDiameter),
    ringsCount: localStorage.ringsCount ?? getRandomNumber(defaults.ringsCount),
    ringsDiameter: localStorage.ringsDiameter ?? getRandomNumber(defaults.ringsDiameter),
    ringsDistance: localStorage.ringsDistance ?? getRandomNumber(defaults.ringsDistance),
    ringsTilt: localStorage.ringsTilt ?? getRandomNumber(defaults.ringsTilt),
    globeTexture: localStorage.globeTexture ?? getRandomElement(defaults.texturePresets),
    color1: localStorage.color1 ?? '#fafafa',
    color2: localStorage.color2 ?? '#0a0a0a',
    color3: localStorage.color3 ?? '#477d85',
    useColor3: localStorage.useColor3 ? JSON.parse(localStorage.useColor3) : false,
    contrast: localStorage.contrast ?? 0.35,
    pixelation: localStorage.pixelation ?? 1,
    rotationSpeed: localStorage.rotationSpeed ?? 2,
    colorPadding: localStorage.colorPadding ?? 0,
    colorName: localStorage.colorName ?? 0,
    donutMode: localStorage.donutMode ? JSON.parse(localStorage.donutMode) : false,
    stopMultiplicator: localStorage.stopMultiplicator ?? 1,
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
        state[property] = payload[property];
        localStorage[property] = payload[property];
    },
    SET_GLOBE_TEXTURE (state, payload) {
        state.globeTexture = payload;
        localStorage.globeTexture = payload;
    },
    SET_COLOR_1 (state, payload) {
        state.color1 = payload;
        localStorage.color1 = payload;
    },
    SET_COLOR_2 (state, payload) {
        state.color2 = payload;
        localStorage.color2 = payload;
    },
    SET_COLOR_3 (state, payload) {
        state.color3 = payload;
        localStorage.color3 = payload;
    },
    SET_USE_COLOR_3 (state, payload) {
        state.useColor3 = payload;
        localStorage.useColor3 = payload.toString();
    },
    SET_DONUT_MODE (state, payload) {
        state.donutMode = payload;
        localStorage.donutMode = payload.toString();
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
    },
    addMidiController (context) {
        const connect = () => {
            navigator.requestMIDIAccess()
                .then(
                    (midi) => midiReady(midi),
                    (err) => console.log('Something went wrong', err));
        };

        const midiReady = (midi) => {
            console.log(midi);
            // Also react to device changes.
            midi.addEventListener('statechange', (event) => initDevices(event.target));
            initDevices(midi); // see the next section!
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
                32: (value) => context.commit('SET_GLOBE_DIAMETER', value),
                33: (value) => context.commit('SET_PIXELATION', value),
            };
            const knobMapping2 = {
                32: 'globeDiameter',
                33: 'pixelation',
            };
            const knob = data['1'];
            const degree = data['2'];

            knobMapping[knob](limitNumber(degree, defaults[knobMapping2[knob]]));
        };

        // Start listening to MIDI messages.
        const startListening = () => {
            for (const input of midiIn) {
                input.addEventListener('midimessage', midiMessageReceived);
            }
        };

        const limitNumber = (number, options) => {
            return Math.min(Math.max(number / 127 * options.max, options.min), options.max);
        };

        connect();
    },
};
