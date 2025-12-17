import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const RAG_STORE = 'fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1';
const MODEL = 'gemini-2.0-flash';
const question = '¿Qué me sirve para bajar el colesterol?';

async function testQuestion() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║      PRUEBA DE PREGUNTA - ANÁLISIS DE RESPUESTA           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('❓ PREGUNTA DEL USUARIO:');
  console.log('   ' + question);
  console.log('\n🤖 MODELO: ' + MODEL);
  console.log('📦 RAG STORE: ' + RAG_STORE + '\n');
  console.log('⏳ Procesando...\n');

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: question + ' Proporciona recomendaciones específicas sobre productos para bajar colesterol.',
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
    console.log('📝 RESPUESTA COMPLETA DE GEMINI:');
    console.log('═'.repeat(60));
    console.log(response.text);
    console.log('═'.repeat(60) + '\n');

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    if (groundingChunks.length > 0) {
      console.log('📎 REFERENCIAS ENCONTRADAS EN DOCUMENTOS:');
      groundingChunks.forEach((chunk, idx) => {
        if (chunk.retrievedContext?.text) {
          const text = chunk.retrievedContext.text;
          console.log(`\n[Referencia ${idx + 1}]:`);
          console.log(`${text.substring(0, 350)}${text.length > 350 ? '...' : ''}`);
        }
      });
    } else {
      console.log('ℹ️  Sin referencias de grounding específicas');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Respuesta completada\n');

    // Análisis de la respuesta
    console.log('📊 ANÁLISIS DE RESPUESTA:');
    console.log('─'.repeat(60));
    const responseLength = response.text.length;
    const hasBulletPoints = response.text.includes('•') || response.text.includes('-');
    const hasNumbers = /\d+\./.test(response.text);
    const hasProductNames = response.text.includes('ESTOP') || response.text.includes('CAFEZZINO') || response.text.includes('TEATINO');
    
    console.log(`Longitud de respuesta: ${responseLength} caracteres`);
    console.log(`Tiene puntos de viñeta: ${hasBulletPoints ? '✅ Sí' : '❌ No'}`);
    console.log(`Tiene listas numeradas: ${hasNumbers ? '✅ Sí' : '❌ No'}`);
    console.log(`Menciona productos Omnilife: ${hasProductNames ? '✅ Sí' : '❌ No'}`);
    console.log('─'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuestion();
