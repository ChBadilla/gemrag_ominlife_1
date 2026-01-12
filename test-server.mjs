import express from 'express';

const app = express();
const PORT = 3001;

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('Server is running!');
});

const server = app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Try: http://localhost:${PORT}/api/health`);
});

// Mantener el proceso vivo
process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.close();
    process.exit(0);
});
