export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'remote-sky',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [
  ],

  plugins: [
    { src: '~/plugins/default.js', mode: 'server' }
  ],

  serverMiddleware: {
    // '/myapp': '~/server/peerServer'
  },
  components: true,

  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  modules: [
  ],

  build: {
  }
}
