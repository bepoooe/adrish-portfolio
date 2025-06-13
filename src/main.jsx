import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './responsive.css'
import { DeviceProvider } from './context/DeviceContext'
import { startMemoryMonitoring, cleanupResources } from './utils/memoryManager'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

// Initialize memory monitoring in development mode
if (import.meta.env.DEV) {
  // Start monitoring with 30-second interval
  const stopMonitoring = startMemoryMonitoring(30000);

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    stopMonitoring();
    cleanupResources();
  });
}

// Setup visibility-based optimization
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // When tab is hidden, clean up resources
    cleanupResources();
  }
});

// Create a memory-optimized app with device context
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DeviceProvider>
      <App />
      <Analytics />
      <SpeedInsights />
    </DeviceProvider>
  </React.StrictMode>,
)
