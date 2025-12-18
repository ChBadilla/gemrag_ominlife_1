const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export interface QueryResult {
    text: string;
    groundingChunks: any[];
}

export async function fileSearch(ragStoreName: string, query: string): Promise<QueryResult> {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ragStoreName, query }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Search request failed');
    }

    return response.json();
}

export async function generateExampleQuestions(ragStoreName: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ragStoreName }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Questions request failed');
    }

    const data = await response.json();
    return data.questions;
}

export function initialize(_apiKey?: string) {
}
