import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'LCX Driver App',
        short_name: 'LCX Driver',
        description: 'Offline-first driver app for Ladywood Circular Exchange',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [] // would normally have 192 and 512 icons here
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})
