import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Output the build files to a folder right next to your extension.ts
    outDir: '../webview-dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Force Vite to use predictable filenames
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})
