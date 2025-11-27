import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      
      manifest: {
        name: 'Pojok Baca PWA',
        short_name: 'PojokBaca',
        description: 'Aplikasi Koleksi Buku Mahasiswa',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      workbox: {
        // 1. Agar SW langsung aktif tanpa nunggu tab ditutup
        clientsClaim: true,
        skipWaiting: true,
        
        // 2. Cache semua file aset lokal (js, css, html, gambar)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],

        runtimeCaching: [
          {
            // 3. CACHE API (PENTING!)
            // Menggunakan strategi 'StaleWhileRevalidate'
            // Artinya: "Tampilkan cache lama dulu biar cepat/bisa offline, baru update dari internet"
            urlPattern: ({ url }) => url.origin === 'https://ta-ppb-backend.vercel.app',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 4. CACHE GAMBAR DARI INTERNET LAINNYA
            // Sama, tampilkan dulu yang ada di memori
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})