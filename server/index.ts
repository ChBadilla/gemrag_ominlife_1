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

// ⚠️ DEBE SER EL PRIMER MIDDLEWARE - Permitir iframe desde dominios autorizados
app.use((req, res, next) => {
  // Remover cualquier header restrictivo existente
  res.removeHeader('X-Frame-Options');
  
  // Permitir iframe desde estos orígenes
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' http://localhost:* http://127.0.0.1:* https://saludnatural360.shop https://*.saludnatural360.shop"
  );
  
  // Permitir cookies en contexto de terceros (iframe)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Permitir que el iframe acceda a storage
  res.setHeader('Permissions-Policy', 'storage-access=(self "http://localhost:*" "https://saludnatural360.shop")');
  
  next();
});

app.use(cors());

app.use(express.json());

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
