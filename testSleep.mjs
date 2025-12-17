import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const RAG_STORE = 'fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1';
const MODEL = 'gemini-2.0-flash';
const question = '¿Tengo mucho sueño y debo trabajar, qué puedo tomar?';

async function testQuestion() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  console.log('\n❓ PREGUNTA: ' + question);
  console.log('🔄 Consultando RAG...\n');

  try {
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
