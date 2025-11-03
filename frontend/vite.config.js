import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import * as sass from 'sass'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        implementation: sass
      }
    }
  },
  resolve: {
    alias: {
      '@constants': path.resolve(__dirname, './src/constants/'),
      '@routes': path.resolve(__dirname, './src/routes/'),
      '@components': path.resolve(__dirname, './src/components/'),
      '@layouts': path.resolve(__dirname, './src/layouts/'),
      '@contexts': path.resolve(__dirname, './src/contexts/'),
      '@styles': path.resolve(__dirname, './src/styles/'),
      '@assets': path.resolve(__dirname, './src/assets/'),
      '@services': path.resolve(__dirname, './src/services/'),
      '@utils': path.resolve(__dirname, './src/utils/'),
      '@pages': path.resolve(__dirname, './src/pages/'),
      '@hooks': path.resolve(__dirname, './src/hooks/'),
      '@config': path.resolve(__dirname, './src/config/'),
      '@schemas': path.resolve(__dirname, './src/schemas/index.js'),
      'use-isomorphic-layout-effect': path.resolve(__dirname, './src/hooks/utils/useIsomorphicLayoutEffect.js')
    }
  },
  build: {
    sourcemap: true
  }
})
