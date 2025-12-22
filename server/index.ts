import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Middleware para permitir iframe desde dominios autorizados
app.use((req, res, next) => {
  // Eliminar header restrictivo por defecto
  res.removeHeader('X-Frame-Options');
  // Permitir iframe solo desde estos orígenes
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' http://localhost:* https://saludnatural360.shop https://*.saludnatural360.shop"
  );
  next();
});

app.use(express.json());

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
