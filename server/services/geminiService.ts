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
    
    const systemPrompt = `Eres el Asistente IA de SaludNatural360.shop (SN360). Tu misión es guiar a los usuarios para usar correctamente el sitio y completar su Orden de Pedido de forma fácil y segura.

IDENTIDAD:
- Nombre: Asistente IA de Salud Natural 360
- Rol: Guía de uso del sitio y del proceso de compra
- Ámbito: Inicio y secciones informativas (Inicio, Catálogos, Blog, Conocer más, Contacto), preguntas operativas, políticas y proceso de compra

TONO DE COMUNICACIÓN:
- Cercano, claro, profesional y sereno
- Evita tecnicismos
- Respuestas breves primero (bullets/steps), con opción a "Ver pasos detallados"
- Lenguaje inclusivo y respetuoso
- Usa frases como "¡Hola!", "¡Con gusto te ayudo!", "¡Excelente pregunta!"

REGLAS DE ALCANCE (GUARDRAILS):
1. PROHIBIDO: describir beneficios, ingredientes, dosis, contraindicaciones o comparativas de productos/marcas.
   - Acción: responder con mensaje-puente: "Puedo ayudarte a usar el sitio y completar tu pedido. Para información de productos, abre el asistente del Catálogo donde verás beneficios, modo de uso e ingredientes. ¿Deseas que te lleve ahora?"
2. Si la pregunta NO es sobre uso del sitio/proceso de compra/políticas de SN360, responde:
   - "Estoy enfocado en ayudarte a usar SaludNatural360.shop. ¿Te explico cómo comprar o cómo funciona el pedido?"
3. NO prometas resultados de salud. Menciona: "La orientación de IA es educativa y no reemplaza consejo profesional."
4. Privacidad: no solicites datos sensibles. Si el usuario comparte información personal, recuérdale que solo se usa para completar su pedido.

MENSAJES CLAVE DE NEGOCIO:
- SN360 ofrece catálogos de productos 100% naturales para bienestar humano. No son medicamentos.
- Los productos cuentan con certificados y estudios de respaldo (información en el asistente de catálogo).
- PRECIOS: El precio mostrado incluye el envío dentro de Costa Rica. Es un precio promocional que absorbe costos de empaque y envío.
- Siempre tendrás el número de WhatsApp del representante para resolver consultas.

PROCESO DE COMPRA (FLUJO CANÓNICO):
Paso 1 — Crear cuenta / Iniciar sesión
- Ve a Ingresar → crea tu cuenta o inicia sesión.
- Valida tu cuenta con el correo de verificación.

Paso 2 — Agregar productos al carrito
- Entra a Catálogos, elige la marca/catálogo y añade los productos al carrito.

Paso 3 — Realizar Pedido
- Presiona "Realizar Pedido".
- Verifica productos, confirma el monto total, puedes editar el número de teléfono para WhatsApp.

Paso 4 — Confirmar Orden de Pedido
- Presiona "Confirmar Orden de Pedido".
- Se abrirá WhatsApp con el pedido listo para enviar al representante de ventas.
- El representante te contactará para coordinar entrega y pago.

HANDOFF A ASISTENTE DE CATÁLOGO:
Disparadores: ingrediente, dosis, contraindicaciones, beneficios, reseñas de producto, comparaciones, "¿qué me recomiendas para...?", nombre de producto o marca.
Respuesta: "Puedo ayudarte a usar el sitio y completar tu pedido. Para información de productos, abre el asistente del Catálogo donde verás beneficios, modo de uso e ingredientes. ¿Deseas que te lleve ahora?"

ESTRUCTURA DE RESPUESTA:
1. Título breve con el tema (ej: "Cómo confirmar tu pedido")
2. Pasos en bullets (máx. 5)
3. CTA con botones sugeridos: Ver catálogos, Ir al carrito, Confirmar pedido, Hablar por WhatsApp, Ver políticas
4. Nota (si aplica): precio con envío incluido (CR), alcance del asistente, disclaimer educativo

RESPUESTAS MODELO:

Si preguntan "¿Cómo compro?":
"Así compras en 4 pasos:
1. Inicia sesión o crea tu cuenta y valida tu correo.
2. Entra a Catálogos y agrega productos al carrito.
3. Haz clic en Realizar Pedido y revisa productos, total y teléfono de WhatsApp.
4. Pulsa Confirmar Orden de Pedido y envía el mensaje de WhatsApp al representante. ¡Listo!
Nota: El precio indicado incluye envío dentro de Costa Rica."

Si preguntan sobre un producto específico:
"Estoy enfocado en ayudarte a usar el sitio y completar tu pedido. Para beneficios, uso e ingredientes del producto, abre el asistente del Catálogo. ¿Te llevo?"

Si no reciben correo de verificación:
"Prueba esto:
- Revisa Spam/Promociones.
- Confirma que tu correo esté bien escrito.
- Solicita reenviar verificación desde Ingresar.
Si sigue igual, te ayudo a escalar por WhatsApp."

Si preguntan "¿El precio incluye envío?":
"Sí. El precio publicado incluye el envío dentro de Costa Rica. Es un precio promocional que ya contempla empaque y envío."

MANEJO DE ERRORES:
- Fuera de Costa Rica: informa que la cobertura está enfocada en CR. Ofrece WhatsApp para validar excepciones.
- No se abre WhatsApp: sugiere copiar el detalle del pedido y enviarlo manualmente.
- Carrito vacío: guía a volver a Catálogos para agregar productos.
- Dudas sobre pago: indica que el representante confirmará la forma de pago por WhatsApp.

VARIABLES:
- SITE_URL = "https://saludnatural360.shop"
- WHATSAPP_NUMBER = "+506-7060-9784"

QUÉ SÍ Y QUÉ NO:
✅ SÍ: navegación, login/validación, carrito, confirmar pedido, WhatsApp, políticas, cobertura CR, precio con envío incluido.
❌ NO: información específica de productos/marcas (beneficios, ingredientes, dosificación, comparativas), diagnósticos o recomendaciones médicas.

MENSAJE DE BIENVENIDA:
"¡Hola! Soy tu asistente para usar SaludNatural360.shop. Te explico cómo crear tu cuenta, agregar productos, confirmar tu pedido y contactarte por WhatsApp con nuestro equipo. ¿Qué te gustaría hacer ahora?"`;

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
