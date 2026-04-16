// vite.config.js
import { defineConfig } from "file:///C:/Users/Lenovo/OneDrive/Documents/E%20drive/adrish-portfolio/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Lenovo/OneDrive/Documents/E%20drive/adrish-portfolio/node_modules/@vitejs/plugin-react/dist/index.mjs";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMZW5vdm9cXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXEUgZHJpdmVcXFxcYWRyaXNoLXBvcnRmb2xpb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTGVub3ZvXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxFIGRyaXZlXFxcXGFkcmlzaC1wb3J0Zm9saW9cXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0xlbm92by9PbmVEcml2ZS9Eb2N1bWVudHMvRSUyMGRyaXZlL2FkcmlzaC1wb3J0Zm9saW8vdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gT3B0aW1pemUgYnVpbGQgc2V0dGluZ3NcclxuICAgIHRhcmdldDogJ2VzMjAxNScsXHJcbiAgICBtaW5pZnk6ICd0ZXJzZXInLFxyXG4gICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICBjb21wcmVzczoge1xyXG4gICAgICAgIC8vIE9wdGltaXplIGZvciBzaXplXHJcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gU3BsaXQgY2h1bmtzIGZvciBiZXR0ZXIgY2FjaGluZ1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgICd2ZW5kb3InOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICd0aHJlZScsICdAcmVhY3QtdGhyZWUvZHJlaScsICdAcmVhY3QtdGhyZWUvZmliZXInXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIE9wdGltaXplIGFzc2V0IGhhbmRsaW5nXHJcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NiwgLy8gNGtiIC0gaW5saW5lIHNtYWxsIGFzc2V0c1xyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMjAwLCAvLyBJbmNyZWFzZSB3YXJuaW5nIGxpbWl0XHJcbiAgfSxcclxuICAvLyBPcHRpbWl6ZSBkZXYgc2VydmVyXHJcbiAgc2VydmVyOiB7XHJcbiAgICAvLyBVc2UgYSBub24tZGVmYXVsdCBkZXYgcG9ydCB0byBhdm9pZCBjb25mbGljdHNcclxuICAgIHBvcnQ6IDUxNzQsXHJcbiAgICBobXI6IHtcclxuICAgICAgb3ZlcmxheTogZmFsc2UsIC8vIERpc2FibGUgSE1SIG92ZXJsYXkgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxyXG4gICAgfSxcclxuICB9LFxyXG4gIC8vIE9wdGltaXplIGZvciBwcm9kdWN0aW9uXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICd0aHJlZScsICdAcmVhY3QtdGhyZWUvZmliZXInLCAnQHJlYWN0LXRocmVlL2RyZWknXSxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1YLFNBQVMsb0JBQW9CO0FBQ2haLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsT0FBTztBQUFBO0FBQUEsSUFFTCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUE7QUFBQSxRQUVSLGNBQWM7QUFBQSxRQUNkLGVBQWU7QUFBQSxNQUNqQjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osVUFBVSxDQUFDLFNBQVMsYUFBYSxTQUFTLHFCQUFxQixvQkFBb0I7QUFBQSxRQUNyRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLG1CQUFtQjtBQUFBO0FBQUEsSUFDbkIsdUJBQXVCO0FBQUE7QUFBQSxFQUN6QjtBQUFBO0FBQUEsRUFFQSxRQUFRO0FBQUE7QUFBQSxJQUVOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQTtBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxTQUFTLGFBQWEsU0FBUyxzQkFBc0IsbUJBQW1CO0FBQUEsRUFDcEY7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
