import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/web-client/',
  server: {
    port: 3010,
    host: true,
    proxy: {
      '/otlp': {
        target: 'http://localhost:4318',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/otlp/, ''),
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
