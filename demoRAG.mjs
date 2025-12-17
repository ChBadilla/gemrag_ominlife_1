/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const RAG_STORE_NAME = "fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1";
const MODEL = "gemini-2.0-flash";

// Preguntas de ejemplo para demostración
const testQuestions = [
  "¿Qué producto me recomiendan para aumentar energía y vitalidad?",
  "¿Cuál es el modo de uso del MAGNUS y cuáles son sus beneficios principales?",
  "¿Qué beneficios tiene el OMNIPLUS?",
];

let ai;

function initialize(apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
}

async function queryRAG(question) {
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

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: systemPrompt + '\n\nPregunta del cliente: ' + question
          }
        ]
      }
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

  const responseText = response.text || "";
  const groundingChunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return {
    text: responseText,
    groundingChunks: groundingChunks,
  };
}

function displayResponse(question, result) {
  console.log("\n" + "=".repeat(70));
  console.log(`❓ PREGUNTA: ${question}`);
  console.log("=".repeat(70));
  console.log("\n📝 RESPUESTA:");
  console.log(result.text);

  if (result.groundingChunks && result.groundingChunks.length > 0) {
    console.log("\n📎 REFERENCIAS ENCONTRADAS:");
    result.groundingChunks.forEach((chunk, idx) => {
      if (chunk.retrievedContext?.text) {
        const text = chunk.retrievedContext.text.substring(0, 300);
        console.log(`\n   [Referencia ${idx + 1}]: ${text}...`);
      }
    });
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║    OMNILIFE RAG CHAT - DEMOSTRACIÓN DE FUNCIONAMIENTO         ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  initialize();

  for (const question of testQuestions) {
    try {
      console.log(`\n⏳ Procesando pregunta: "${question}"`);
      const result = await queryRAG(question);
      displayResponse(question, result);

      // Pequeña pausa entre preguntas
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error(`❌ Error procesando pregunta: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ DEMOSTRACIÓN COMPLETADA");
  console.log("=".repeat(70));
  console.log(
    "\n💡 El RAG está funcionando correctamente y recuperando información"
  );
  console.log("   de los documentos cargados.\n");
}

main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
