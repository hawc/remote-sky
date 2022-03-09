import { defineNuxtConfig } from 'nuxt3';
import { peerServer } from './server/peerServer';

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    hooks: {
        'render:before': () => console.log('asdfg'),
        'vite:serverCreated'(server) {
            peerServer(server);
        }
    }
})
