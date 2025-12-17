import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const RAG_STORE = 'fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1';
const MODEL = 'gemini-2.0-flash';
const question = '¿Qué productos Omnilife sirven para energía y combatir el cansancio? Menciona TODOS los productos relacionados incluyendo Cafezzino, Magnus, Power Maker, Starbien y Ego 10.';

async function testQuestion() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  console.log('\n❓ PREGUNTA: ' + question);
  console.log('🔄 Consultando RAG...\n');

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: question
            }
          ]
        }
      ],
      tools: [
        {
          googleSearch: {},
          fileSearch: {
            fileSearchStoreNames: [RAG_STORE],
          },
        },
      ],
    });

    console.log('═'.repeat(70));
    console.log('📝 RESPUESTA:');
    console.log('═'.repeat(70));
    console.log(response.text);
    console.log('═'.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuestion();
