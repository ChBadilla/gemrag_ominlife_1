/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";

export interface QueryResult {
    text: string;
    groundingChunks: any[];
}

let ai: GoogleGenAI;

export function initialize(apiKey?: string) {
    ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
}

async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fileSearch(ragStoreName: string, query: string): Promise<QueryResult> {
    if (!ai) throw new Error("Gemini AI not initialized");
    
    const systemPrompt = `Eres un asistente experto en productos Omnilife. Responde de forma precisa y enfocada.

INSTRUCCIONES:
1. Responde ÚNICAMENTE lo que el usuario pregunta - no agregues información no solicitada.
2. Si preguntan sobre un producto específico (ingredientes, modo de uso, beneficios), responde solo sobre ese producto.
3. NO ofrezcas productos adicionales a menos que el usuario lo solicite explícitamente (ej: "¿qué más me recomiendas?", "¿qué producto me ayuda con...?").
4. Solo cuando el usuario pida una recomendación de productos, sugiere los más relevantes para su necesidad.
5. Incluye el disclaimer médico SOLO cuando la respuesta involucre beneficios para la salud: "Nota: Esta información no reemplaza la consulta médica profesional."
6. Sé conciso, directo y profesional.
7. NO incluyas secciones sobre la marca, calidad o historia de la empresa.

MODO AMPLIADO (cuando el usuario use palabras como "explique", "explica", "explícame", "amplia", "amplía", "detalla"):
- Proporciona una respuesta completa y detallada que incluya:
  a) Respuesta directa a la pregunta
  b) Modo de uso del producto
  c) Contraindicaciones (si las tiene)
  d) Información adicional relevante del RAG
  e) Sugerencias de otros productos complementarios

SOBRE EL CREADOR:
- Si preguntan quién creó Omnilife, la empresa, los productos, o el fundador: responde con información sobre Omnilife y su historia.
- Si preguntan quién creó este asistente, el bot, la IA, o el chat: responde "Este Asistente IA fue creado por el equipo de Artifexteam, bajo la plataforma de Google."

PRECIOS Y EXISTENCIAS:
- Si preguntan por precio, costo, valor, disponibilidad o existencias de productos, responde: "Digite el nombre del producto en la barra de búsqueda del Catálogo Digital y se mostrará la información de costo y la opción para incluirla al carrito de compras."

CONSULTAS GENERALES:
- Si la pregunta es genérica y fuera del contexto de productos Omnilife (condiciones de entrega, políticas, formas de pago, información general de la empresa, modalidad de trabajo, u otras consultas no relacionadas directamente con los productos del catálogo), responde: "Para esta consulta, te sugiero conversar con el Agente IA que se encuentra en la página principal. Ahí encontrarás información general y amplia sobre la empresa y modalidad de trabajo."`;

    const response = await ai.models.generateContent({
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
    } as any);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
        text: response.text || '',
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
        } as any);
        
        let jsonText = (response.text || '').trim();

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

            if (typeof firstItem === 'object' && firstItem !== null && 'questions' in firstItem && Array.isArray(firstItem.questions)) {
                return parsedData.flatMap(item => (item.questions || [])).filter(q => typeof q === 'string');
            }
            
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
