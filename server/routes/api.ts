import { Router, Request, Response } from 'express';
import * as geminiService from '../services/geminiService.js';

const router = Router();

let isInitialized = false;

function ensureInitialized() {
    if (!isInitialized) {
        geminiService.initialize(process.env.API_KEY);
        isInitialized = true;
    }
}

interface SearchRequestBody {
    ragStoreName: string;
    query: string;
}

interface QuestionsRequestBody {
    ragStoreName: string;
}

router.post('/search', async (req: Request<{}, {}, SearchRequestBody>, res: Response) => {
    try {
        ensureInitialized();
        const { ragStoreName, query } = req.body;

        if (!ragStoreName || !query) {
            res.status(400).json({ error: 'ragStoreName and query are required' });
            return;
        }

        const result = await geminiService.fileSearch(ragStoreName, query);
        res.json(result);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        });
    }
});

router.post('/questions', async (req: Request<{}, {}, QuestionsRequestBody>, res: Response) => {
    try {
        ensureInitialized();
        const { ragStoreName } = req.body;

        if (!ragStoreName) {
            res.status(400).json({ error: 'ragStoreName is required' });
            return;
        }

        const questions = await geminiService.generateExampleQuestions(ragStoreName);
        res.json({ questions });
    } catch (error) {
        console.error('Questions generation error:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error' 
        });
    }
});

router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

export default router;
