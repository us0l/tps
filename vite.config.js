import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // vite.config.js
  server: {
    // Expose on all network interfaces
    host: '0.0.0.0',
    // History API Fallback
    historyApiFallback: true,
  }
})
