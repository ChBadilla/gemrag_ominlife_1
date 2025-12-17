/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const RAG_STORE_NAME = "fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1";
const MODEL = "gemini-2.0-flash";

async function testRAG() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const question = "¿Cuál es el producto MAGNUS y cuál es su modo de uso?";

  console.log("═".repeat(70));
  console.log("PRUEBA DE RAG - GEMINI 2.0 FLASH");
  console.log("═".repeat(70));
  console.log(`\n❓ Pregunta: ${question}`);
  console.log(`📦 RAG Store: ${RAG_STORE_NAME}`);
  console.log(`🤖 Modelo: ${MODEL}\n`);

  try {
    console.log("⏳ Enviando solicitud a Gemini...\n");

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

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt + '\n\nPregunta del cliente: ' + question,
            },
          ],
        },
      ],
      tools: [
        {
          googleSearch: {},
          fileSearch: {
            fileSearchStoreNames: [RAG_STORE_NAME],
          },
        },
      ],
    });

    console.log("✅ Respuesta recibida:\n");
    console.log(response.text);

    console.log("\n" + "─".repeat(70));
    console.log("📎 METADATA DE GROUNDING:");

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    if (groundingChunks.length > 0) {
      console.log(`Se encontraron ${groundingChunks.length} referencias:\n`);
      groundingChunks.forEach((chunk, idx) => {
        if (chunk.retrievedContext?.text) {
          console.log(`[${idx + 1}] ${chunk.retrievedContext.text}\n`);
        }
      });
    } else {
      console.log("⚠️  No se encontraron referencias (el RAG podría no estar siendo consultado)");
    }

    console.log("═".repeat(70));
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testRAG();
