import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build settings
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        // Optimize for size
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'three', '@react-three/drei', '@react-three/fiber'],
        },
      },
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // 4kb - inline small assets
    chunkSizeWarningLimit: 1200, // Increase warning limit
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false, // Disable HMR overlay for better performance
    },
  },
  // Optimize for production
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
  },
})
