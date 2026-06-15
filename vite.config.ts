/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      // 多页应用：index.html=官网落地页，editor.html=编辑器。
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        editor: fileURLToPath(new URL('./editor.html', import.meta.url)),
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          codemirror: [
            'codemirror',
            '@codemirror/state',
            '@codemirror/view',
            '@codemirror/commands',
            '@codemirror/lang-markdown',
          ],
          markdown: [
            'unified',
            'remark-parse',
            'remark-gfm',
            'remark-rehype',
            'remark-stringify',
            'rehype-sanitize',
            'hast-util-to-html',
            'hast-util-to-jsx-runtime',
          ],
          highlight: ['lowlight', 'highlight.js'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
