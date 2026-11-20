import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const hmrDisabled = process.env.DISABLE_HMR === 'true'

function disableClientHmrSocket() {
  return {
    name: 'disable-client-hmr-socket',
    apply: 'serve',
    transform(code, id) {
      if (hmrDisabled && id.includes('vite/dist/client/client.mjs')) {
        return code.replace(
          'transport.connect(createHMRHandler(handleMessage));',
          '/* HMR WebSocket disabled via DISABLE_HMR=true */'
        )
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), disableClientHmrSocket()],
  server: {
    port: 3000,
    host: true,
    hmr: !hmrDisabled,
    ws: !hmrDisabled
  }
})
