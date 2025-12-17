/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const RAG_STORE_NAME = "fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1";
const MODEL = "gemini-2.0-flash";

let ai;
let chatHistory = [];

function initialize(apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
}

async function queryRAG(question) {
  if (!ai) throw new Error("Gemini AI not initialized");

  const fullPrompt =
    question +
    " DO NOT ASK THE USER TO READ THE MANUAL, pinpoint the relevant sections in the response itself.";

  console.log("\n🤖 Gemini está analizando...\n");

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: fullPrompt,
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

function displayResponse(result) {
  console.log("📝 RESPUESTA:");
  console.log("─".repeat(60));
  console.log(result.text);
  console.log("─".repeat(60));

  if (result.groundingChunks && result.groundingChunks.length > 0) {
    console.log("\n📎 REFERENCIAS ENCONTRADAS EN DOCUMENTOS:");
    result.groundingChunks.forEach((chunk, idx) => {
      if (chunk.retrievedContext?.text) {
        const text = chunk.retrievedContext.text.substring(0, 200);
        console.log(`\n[${idx + 1}] ${text}...`);
      }
    });
  }
  console.log("\n");
}

async function main() {
  initialize();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       OMNILIFE RAG CHAT - ASISTENTE DE PRODUCTOS          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  console.log(
    "💬 Hola, soy tu asistente Omnilife. Puedo responder preguntas sobre:"
  );
  console.log("   - Productos y sus beneficios");
  console.log("   - Modo de uso y dosificación");
  console.log("   - Componentes e ingredientes");
  console.log("   - Recomendaciones de salud\n");
  console.log('Escribe "salir" para terminar.\n');

  const askQuestion = () => {
    rl.question("🔍 Tu pregunta: ", async (question) => {
      if (question.toLowerCase() === "salir") {
        console.log(
          "\n👋 ¡Gracias por usar Omnilife RAG Chat! Que tengas un excelente día.\n"
        );
        rl.close();
        return;
      }

      if (!question.trim()) {
        console.log("⚠️  Por favor, escribe una pregunta.\n");
        askQuestion();
        return;
      }

      try {
        const result = await queryRAG(question);
        displayResponse(result);
        askQuestion();
      } catch (error) {
        console.error("❌ Error:", error.message);
        askQuestion();
      }
    });
  };

  // Preguntas de ejemplo
  console.log("📌 EJEMPLOS DE PREGUNTAS QUE PUEDES HACER:");
  console.log(
    "  • ¿Qué producto me recomiendan para aumentar energía y vitalidad?"
  );
  console.log("  • ¿Cuál es el modo de uso del MAGNUS?");
  console.log("  • ¿Qué beneficios tiene el OMNIPLUS?");
  console.log(
    "  • ¿Cuál es el mejor producto para mejorar la digestión y flora intestinal?"
  );
  console.log("  • ¿Qué ingredientes contiene el UNDÚ para las articulaciones?\n");

  askQuestion();
}

main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
