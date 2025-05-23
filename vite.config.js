import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow connections from specific domains
    allowedHosts: ['apper-test-9ddd65f035b1453685310f5a19832ad8.fly.dev'],
    // Configure HMR connection
    hmr: {
      // Explicitly set to WebSocket protocol for reliable connection
      protocol: 'ws',
      // Increase timeout to handle slow connections
      timeout: 30000,
      // Make HMR connection more reliable by adding overlay
      overlay: true
    },
    // Increase server timeout
    watch: {
      usePolling: false,
      interval: 1000,
    }
  },
  define: { 'process.env': {} }
});