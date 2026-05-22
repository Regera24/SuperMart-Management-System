import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Skip proxy for browser page navigations — serve index.html for SPA routing
function bypassHtml(req) {
  if (req.headers.accept?.includes('text/html')) {
    return '/index.html'
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // All requests go through API Gateway (port 8080)
      // bypass: skip proxy for browser page navigations (Accept: text/html)
      //         so SPA routes like /orders, /products don't get forwarded to backend on reload
      '/auth':                 { target: 'http://localhost:8080', changeOrigin: true },
      '/users':                { target: 'http://localhost:8080', changeOrigin: true },
      '/products':             { target: 'http://localhost:8080', changeOrigin: true, bypass: bypassHtml },
      '/categories':           { target: 'http://localhost:8080', changeOrigin: true, bypass: bypassHtml },
      '/files':                { target: 'http://localhost:8080', changeOrigin: true },
      '/orders':               { target: 'http://localhost:8080', changeOrigin: true, bypass: bypassHtml },
      '/customers':            { target: 'http://localhost:8080', changeOrigin: true, bypass: bypassHtml },
      '/inventory':            { target: 'http://localhost:8080', changeOrigin: true, bypass: bypassHtml },
      '/suppliers':            { target: 'http://localhost:8080', changeOrigin: true },
      '/warehouses':           { target: 'http://localhost:8080', changeOrigin: true },
      '/import-receipts':      { target: 'http://localhost:8080', changeOrigin: true },
      '/loyalty-rules':        { target: 'http://localhost:8080', changeOrigin: true },
      '/tier-configs':         { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/staff':         { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/notifications': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/reports':       { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
