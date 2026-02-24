import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // 代理 SiliconFlow S3 图片请求，绕过 CORS
      '/s3-proxy': {
        target: 'https://s3.siliconflow.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3-proxy/, ''),
        secure: false,  // 忽略SSL证书验证
      },
    },
  },
})
