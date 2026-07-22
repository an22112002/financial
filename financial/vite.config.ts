import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: [
      "ngoan.io.vn",
      "www.ngoan.io.vn"
    ]
  }
})


// LAN development
// export default defineConfig({
//   plugins: [
//     react(),
//     basicSsl()
//   ],
//   server: {
//     host: true,
//     port: 8080,
//     https: true
//   }
// })