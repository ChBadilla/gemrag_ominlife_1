import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const RAG_STORE = 'fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1';
const MODEL = 'gemini-2.0-flash';
const question = '¿Puedo mezclar más de 4 productos?';

async function testQuestion() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        PRUEBA DE PREGUNTA - OMNILIFE RAG CHAT             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('❓ Pregunta: ' + question);
  console.log('🤖 Modelo: ' + MODEL + '\n');
  console.log('⏳ Procesando...\n');

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: question + ' DO NOT ASK THE USER TO READ THE MANUAL, pinpoint the relevant sections in the response itself.',
      tools: [
        {
          googleSearch: {},
          fileSearch: {
            fileSearchStoreNames: [RAG_STORE],
          },
        },
      ],
    });

    console.log('═'.repeat(60));
    console.log('📝 RESPUESTA DE GEMINI:');
    console.log('═'.repeat(60));
    console.log(response.text);
    console.log('═'.repeat(60) + '\n');

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    if (groundingChunks.length > 0) {
      console.log('📎 REFERENCIAS ENCONTRADAS EN DOCUMENTOS:');
      groundingChunks.forEach((chunk, idx) => {
        if (chunk.retrievedContext?.text) {
          const text = chunk.retrievedContext.text.substring(0, 250);
          console.log('[' + (idx + 1) + '] ' + text + '...');
        }
      });
    } else {
      console.log('ℹ️  (Sin referencias específicas en el grounding)');
    }

    console.log('\n✅ Prueba completada\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuestion();
