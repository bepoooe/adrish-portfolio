// vite.config.js
import { defineConfig } from "file:///C:/Users/Lenovo/OneDrive/Documents/adrish-portfolio/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Lenovo/OneDrive/Documents/adrish-portfolio/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  build: {
    // Optimize build settings
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        // Optimize for size
        drop_console: true,
        drop_debugger: true
      }
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor": ["react", "react-dom", "three", "@react-three/drei", "@react-three/fiber"]
        }
      }
    },
    // Optimize asset handling
    assetsInlineLimit: 4096,
    // 4kb - inline small assets
    chunkSizeWarningLimit: 1200
    // Increase warning limit
  },
  // Optimize dev server
  server: {
    // Use a non-default dev port to avoid conflicts
    port: 5174,
    hmr: {
      overlay: false
      // Disable HMR overlay for better performance
    }
  },
  // Optimize for production
  optimizeDeps: {
    include: ["react", "react-dom", "three", "@react-three/fiber", "@react-three/drei"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMZW5vdm9cXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXGFkcmlzaC1wb3J0Zm9saW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXExlbm92b1xcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcYWRyaXNoLXBvcnRmb2xpb1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTGVub3ZvL09uZURyaXZlL0RvY3VtZW50cy9hZHJpc2gtcG9ydGZvbGlvL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIE9wdGltaXplIGJ1aWxkIHNldHRpbmdzXHJcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICAvLyBPcHRpbWl6ZSBmb3Igc2l6ZVxyXG4gICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcclxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIFNwbGl0IGNodW5rcyBmb3IgYmV0dGVyIGNhY2hpbmdcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAndmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAndGhyZWUnLCAnQHJlYWN0LXRocmVlL2RyZWknLCAnQHJlYWN0LXRocmVlL2ZpYmVyJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICAvLyBPcHRpbWl6ZSBhc3NldCBoYW5kbGluZ1xyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsIC8vIDRrYiAtIGlubGluZSBzbWFsbCBhc3NldHNcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTIwMCwgLy8gSW5jcmVhc2Ugd2FybmluZyBsaW1pdFxyXG4gIH0sXHJcbiAgLy8gT3B0aW1pemUgZGV2IHNlcnZlclxyXG4gIHNlcnZlcjoge1xyXG4gICAgLy8gVXNlIGEgbm9uLWRlZmF1bHQgZGV2IHBvcnQgdG8gYXZvaWQgY29uZmxpY3RzXHJcbiAgICBwb3J0OiA1MTc0LFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIG92ZXJsYXk6IGZhbHNlLCAvLyBEaXNhYmxlIEhNUiBvdmVybGF5IGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcclxuICAgIH0sXHJcbiAgfSxcclxuICAvLyBPcHRpbWl6ZSBmb3IgcHJvZHVjdGlvblxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAndGhyZWUnLCAnQHJlYWN0LXRocmVlL2ZpYmVyJywgJ0ByZWFjdC10aHJlZS9kcmVpJ10sXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1VixTQUFTLG9CQUFvQjtBQUNwWCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBO0FBQUEsUUFFUixjQUFjO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFVBQVUsQ0FBQyxTQUFTLGFBQWEsU0FBUyxxQkFBcUIsb0JBQW9CO0FBQUEsUUFDckY7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxtQkFBbUI7QUFBQTtBQUFBLElBQ25CLHVCQUF1QjtBQUFBO0FBQUEsRUFDekI7QUFBQTtBQUFBLEVBRUEsUUFBUTtBQUFBO0FBQUEsSUFFTixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUE7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLFNBQVMsc0JBQXNCLG1CQUFtQjtBQUFBLEVBQ3BGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
