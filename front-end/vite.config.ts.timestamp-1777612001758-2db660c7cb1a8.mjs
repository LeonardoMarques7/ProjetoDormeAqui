// vite.config.ts
import path from "path";
import tailwindcss from "file:///C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "file:///C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\leona\\Desktop\\ProjetoDormeAqui\\front-end";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: [
      "@fullcalendar/react",
      "@fullcalendar/daygrid",
      "@fullcalendar/timegrid",
      "@fullcalendar/list",
      "@fullcalendar/interaction",
      "@fullcalendar/core/locales/pt-br"
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  server: {
    // 1. Configura o Proxy
    proxy: {
      // Qualquer requisição que comece com /api será redirecionada para o backend
      "/api": {
        target: "http://localhost:3000",
        // Altere para a porta que seu Express usa!
        changeOrigin: true,
        // Necessário para evitar problemas de CORS
        secure: false
      },
      // Faz o mesmo para a rota /tmp
      "/tmp": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxsZW9uYVxcXFxEZXNrdG9wXFxcXFByb2pldG9Eb3JtZUFxdWlcXFxcZnJvbnQtZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxsZW9uYVxcXFxEZXNrdG9wXFxcXFByb2pldG9Eb3JtZUFxdWlcXFxcZnJvbnQtZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9sZW9uYS9EZXNrdG9wL1Byb2pldG9Eb3JtZUFxdWkvZnJvbnQtZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIlxyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcIkB0YWlsd2luZGNzcy92aXRlXCJcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCJcclxuXHJcbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFtcclxuICAgICAgXCJAZnVsbGNhbGVuZGFyL3JlYWN0XCIsXHJcbiAgICAgIFwiQGZ1bGxjYWxlbmRhci9kYXlncmlkXCIsXHJcbiAgICAgIFwiQGZ1bGxjYWxlbmRhci90aW1lZ3JpZFwiLFxyXG4gICAgICBcIkBmdWxsY2FsZW5kYXIvbGlzdFwiLFxyXG4gICAgICBcIkBmdWxsY2FsZW5kYXIvaW50ZXJhY3Rpb25cIixcclxuICAgICAgXCJAZnVsbGNhbGVuZGFyL2NvcmUvbG9jYWxlcy9wdC1iclwiLFxyXG4gICAgXSxcclxuICB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIC8vIDEuIENvbmZpZ3VyYSBvIFByb3h5XHJcbiAgICBwcm94eToge1xyXG4gICAgICAvLyBRdWFscXVlciByZXF1aXNpXHUwMEU3XHUwMEUzbyBxdWUgY29tZWNlIGNvbSAvYXBpIHNlclx1MDBFMSByZWRpcmVjaW9uYWRhIHBhcmEgbyBiYWNrZW5kXHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsIC8vIEFsdGVyZSBwYXJhIGEgcG9ydGEgcXVlIHNldSBFeHByZXNzIHVzYSFcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsIC8vIE5lY2Vzc1x1MDBFMXJpbyBwYXJhIGV2aXRhciBwcm9ibGVtYXMgZGUgQ09SU1xyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIEZheiBvIG1lc21vIHBhcmEgYSByb3RhIC90bXBcclxuICAgICAgJy90bXAnOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlWLE9BQU8sVUFBVTtBQUNsVyxPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFIN0IsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxFQUNoQyxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUNwQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQTtBQUFBLElBRU4sT0FBTztBQUFBO0FBQUEsTUFFTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUE7QUFBQSxRQUNSLGNBQWM7QUFBQTtBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQTtBQUFBLE1BRUEsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
