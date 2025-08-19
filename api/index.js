// Vercel serverless function entry point
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let server = null;

export default async function handler(req, res) {
  if (!server) {
    try {
      // Import the built server
      const serverPath = join(__dirname, '..', 'dist', 'index.js');
      const { default: createServer } = await import(serverPath);
      
      if (typeof createServer === 'function') {
        const { app } = await createServer();
        server = app;
      } else {
        // Fallback if the export structure is different
        server = createServer;
      }
    } catch (error) {
      console.error('Failed to load server:', error);
      return res.status(500).json({ error: 'Server initialization failed' });
    }
  }
  
  return server(req, res);
}