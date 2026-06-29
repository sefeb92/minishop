import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localRegisterPlugin } from './src/api/devServer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localRegisterPlugin()],
  server: {
    port: 3000,
  },
})
