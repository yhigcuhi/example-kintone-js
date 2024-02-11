/** import node */
import { resolve } from 'path'
/** import vite */
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    // import @/の対応
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    // docker host用
    server: {
        host: true
    },
})