import { defineConfig } from 'vite'
import { resolve } from 'path'
export default defineConfig({
  base: './',
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'screenLog',
      fileName: 'index',
    },
  },
  server: {
    port: 3000,
  },
  preview:{
    port: 3001,
  },
  test: {
    includeSource: [
      'test/**/*.ts',
    ],
  },
  define: {
    'import.meta.vitest': false,
  },
})