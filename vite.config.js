import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*  Vercel serves the site from the domain root — dexoid.vercel.app/ or your
    own domain — so base stays '/'. (It only needs to be '/<repo>/' when
    deploying to GitHub Pages, which serves project sites from a subpath.)     */

export default defineConfig({
  plugins: [react()],
  base: '/',
});
