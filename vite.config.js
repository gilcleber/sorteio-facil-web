import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Se for build do Electron, usa base relativa './', senão usa '/sorteio-facil-web/' para GH Pages
  base: process.env.ELECTRON_BUILD ? './' : '/sorteio-facil-web/',
})
