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
  }
});