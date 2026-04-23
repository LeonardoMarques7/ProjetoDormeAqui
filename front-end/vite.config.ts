import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      "@fullcalendar/react",
      "@fullcalendar/daygrid",
      "@fullcalendar/timegrid",
      "@fullcalendar/list",
      "@fullcalendar/interaction",
      "@fullcalendar/core/locales/pt-br",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // 1. Configura o Proxy
    proxy: {
      // Qualquer requisição que comece com /api será redirecionada para o backend
      '/api': {
        target: 'http://localhost:3000', // Altere para a porta que seu Express usa!
        changeOrigin: true, // Necessário para evitar problemas de CORS
        secure: false,
      },
      // Faz o mesmo para a rota /tmp
      '/tmp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
})
