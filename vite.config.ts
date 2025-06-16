import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  plugins: [
    commonjs({
      include: [
        /node_modules/,
        /hoist-non-react-statics/
      ]
    }),
    react()
  ],
  build: {
    commonjsOptions: {
      include: [/date-fns/, /hoist-non-react-statics/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        }
      }
    }
  },
  resolve: {
    dedupe: ['date-fns', 'hoist-non-react-statics', '@emotion/react', '@emotion/styled'],
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
  define: {
    'import.meta.env.SUPABASE_URL': JSON.stringify('https://fwsqvutgtwjyjbukydsy.supabase.co'),
    'import.meta.env.SUPABASE_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3c3F2dXRndHdqeWpidWt5ZHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTczNjgsImV4cCI6MjA2NTU5MzM2OH0.JUtKdyPA7Eh8N_mUe73yPMhehaQzkjFOA6EqD5HG9Ko')
  }
});