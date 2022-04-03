import colorscale from 'colormap/colorScale';
const colors = Object.keys(colorscale);
const shades = 40;

const textures = [
    'mercury',
    'venus',
    'earth',
    'moon',
    'mars',
];

const defaults = {
    globeDiameter: {
        min: 1,
        max: 170,
        step: 1,
    },
    ringsCount: {
        min: 0,
        max: 4,
        step: 1,
    },
    ringsDiameter: {
        min: 1,
        max: 20,
        step: 0.1,
    },
    ringsDistance: {
        min: 0,
        max: 1,
        step: 0.01,
    },
    ringsTilt: {
        min: 0,
        max: 1,
        step: 0.01,
    },
    pixelation: {
        min: 0.2,
        max: 1.5,
        step: 0.1,
    },
    rotationSpeed: {
        min: 1,
        max: 15,
        step: 0.1,
    },
    colorName: {
        min: 0,
        max: colors.length - 1,
        step: 1,
    },
    colorPadding: {
        min: 0,
        max: (shades - (shades % 2)) - 1,
        step: 1,
    },
    contrast: {
        min: 0,
        max: 1,
        step: 0.01,
    },
    globeTexture: {
        min: 0,
        max: textures.length - 1,
        step: 1,
    },
    modelType: {
        min: 0,
        max: 2,
        step: 1,
    },
};

export {
    defaults,
    textures,
}