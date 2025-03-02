/// <reference types="vitest" />
import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

interface VitestUserConfig extends UserConfig {
  test: {
    globals: boolean
    environment: string
    setupFiles: string[]
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
} satisfies VitestUserConfig)
