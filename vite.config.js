import {defineConfig}        from 'vite'
import {fileURLToPath, URL} from 'node:url'
import vue                  from '@vitejs/plugin-vue'


const tokens = fileURLToPath(
  new URL('./src/assets/styl/tokens.styl', import.meta.url))


export default defineConfig({
  plugins: [vue()],

  css: {
    preprocessorOptions: {
      stylus: {additionalData: '@require "' + tokens + '"\n'}
    }
  },

  build: {assetsDir: 'static'},   // hashed chunks -> /static/, not /assets/

  server: {port: 3000}
})
