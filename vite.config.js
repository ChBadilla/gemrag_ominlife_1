import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Permitir VS Code Simple Browser y otros orígenes
      'Content-Security-Policy': "frame-ancestors 'self' http://localhost:* http://127.0.0.1:* https://saludnatural360.shop https://*.saludnatural360.shop vscode-webview://* vscode-file://*",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
