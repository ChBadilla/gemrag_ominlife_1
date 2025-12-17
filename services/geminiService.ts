/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { RagStore, Document, QueryResult, CustomMetadata } from '../types';

let ai: GoogleGenAI;

export function initialize(apiKey?: string) {
    ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
}

async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createRagStore(displayName: string): Promise<string> {
    if (!ai) throw new Error("Gemini AI not initialized");
    const ragStore = await ai.fileSearchStores.create({ config: { displayName } });
    if (!ragStore.name) {
        throw new Error("Failed to create RAG store: name is missing.");
    }
    return ragStore.name;
}

export async function uploadToRagStore(ragStoreName: string, file: File): Promise<void> {
    if (!ai) throw new Error("Gemini AI not initialized");
    
    let op = await ai.fileSearchStores.uploadToFileSearchStore({
        fileSearchStoreName: ragStoreName,
        file: file
    });

    while (!op.done) {
        await delay(3000);
        op = await ai.operations.get({operation: op});
    }
}

export async function fileSearch(ragStoreName: string, query: string): Promise<QueryResult> {
    if (!ai) throw new Error("Gemini AI not initialized");
    
    const systemPrompt = `Responde con enfoque comercial y positivo. 
    
INSTRUCCIONES IMPORTANTES:
1. Comienza CON UN ÚNICO disclaimer médico breve en la primera línea: "Nota: Esta información no reemplaza la consulta médica profesional."
2. NO repitas el disclaimer más adelante - aparece UNA SOLA VEZ.
3. Recomienda TODOS los productos Omnilife específicos que pueden ayudar con la necesidad mencionada.
4. Para cada producto: menciona sus beneficios principales y cómo usarlo.
5. Incluye variedad de opciones - no excluyas productos por consideraciones secundarias (ej: cafeína).
6. Sé conciso y directo - solo información relevante a la pregunta.
7. NO incluyas secciones sobre la marca, calidad o historia de la empresa.
8. Mantén un tono comercial, positivo y profesional.
9. Termina después de explicar los productos y su uso - sin párrafos de cierre motivador.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: systemPrompt + '\n\nPregunta del cliente: ' + query
                    }
                ]
            }
        ],
        tools: [
            {
                googleSearch: {},
                fileSearch: {
                    fileSearchStoreNames: [ragStoreName],
                }
            }
        ]
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
        text: response.text,
        groundingChunks: groundingChunks,
    };
}

export async function generateExampleQuestions(ragStoreName: string): Promise<string[]> {
    if (!ai) throw new Error("Gemini AI not initialized");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: "You are provided with information about Omnilife products. Based on the documents, generate 5 short and practical example questions in Spanish that customers might ask about Omnilife products. Return the questions as a JSON array of strings."
                        }
                    ]
                }
            ],
            tools: [
                {
                    googleSearch: {},
                    fileSearch: {
                        fileSearchStoreNames: [ragStoreName],
                    }
                }
            ]
        });
        
        let jsonText = response.text.trim();

        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonText = jsonMatch[1];
        } else {
            const firstBracket = jsonText.indexOf('[');
            const lastBracket = jsonText.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                jsonText = jsonText.substring(firstBracket, lastBracket + 1);
            }
        }
        
        const parsedData = JSON.parse(jsonText);
        
        if (Array.isArray(parsedData)) {
            if (parsedData.length === 0) {
                return [];
            }
            const firstItem = parsedData[0];

            // Handle new format: array of {product, questions[]}
            if (typeof firstItem === 'object' && firstItem !== null && 'questions' in firstItem && Array.isArray(firstItem.questions)) {
                return parsedData.flatMap(item => (item.questions || [])).filter(q => typeof q === 'string');
            }
            
            // Handle old format: array of strings
            if (typeof firstItem === 'string') {
                return parsedData.filter(q => typeof q === 'string');
            }
        }
        
        console.warn("Received unexpected format for example questions:", parsedData);
        return [];
    } catch (error) {
        console.error("Failed to generate or parse example questions:", error);
        return [];
    }
}


export async function deleteRagStore(ragStoreName: string): Promise<void> {
    if (!ai) throw new Error("Gemini AI not initialized");
    await ai.fileSearchStores.delete({
        name: ragStoreName,
        config: { force: true },
    });
}
