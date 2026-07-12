export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-07-12',
  devtools: { enabled: true },
  devServer: {
    port: 8610,
  },
  app: {
    head: {
      title: 'DOCX Viewer',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
})
