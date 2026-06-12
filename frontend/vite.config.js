import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // Tailwind v4 uses Vite plugin (not PostCSS)
  ],

  // ── Dev Server Proxy ────────────────────────────────────────
  // This forwards all /api requests from the React app (port 5173)
  // to the Express backend (port 4000).
  //
  // WHY: Without this, the browser treats them as cross-origin
  // (different ports = different origin), and cookies won't be sent.
  // With the proxy, both frontend and backend appear to be on port 5173
  // to the browser, so cookies work perfectly.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,   // Rewrites the Host header to match the target
      },
    },
  },
})
