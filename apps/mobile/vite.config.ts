// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'VGR AgroPilot',
        short_name: 'AgroPilot',
        description: 'Sistema de relatórios de aviação agrícola da VGR',
        theme_color: '#283E55',
        background_color: '#1A1F2E',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Arquivos que o service worker vai guardar em cache
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Se o backend não responder, não quebra o app
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:3333\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
})