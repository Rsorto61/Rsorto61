import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site: https://rsorto61.github.io/Rsorto61/
  base: process.env.CADENCE_BASE || '/',
  preview: {
    // Allow Cloudflare quick tunnels and other reverse proxies
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
  },
})
