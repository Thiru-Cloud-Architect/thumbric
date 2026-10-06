/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** GitHub project site: `/thumbforge/` matches repo name. Custom domain: set VITE_BASE_PATH=/ */
const base = process.env.VITE_BASE_PATH || '/thumbforge/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 43201,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 43201,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
  },
})
