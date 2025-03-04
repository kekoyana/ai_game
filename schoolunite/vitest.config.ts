/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**/*',
        'src/types/**/*',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ]
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}']
  }
})