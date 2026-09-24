import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './server/app.ts';

async function startServer() {
  const app = createExpressApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const distPath = path.join(process.cwd(), 'dist');
  const distExists = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (distExists && process.env.NODE_ENV !== 'development');

  // Vite middleware setup in development or static dist serving in production
  if (isProduction && distExists) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DRISHTI-AID] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
