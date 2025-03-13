import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/movie app/' // Add this line  to vite.config.js file  to fix the issue  of 404 error on page refresh  in github pages   
})
