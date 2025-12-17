import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const RAG_STORE = 'fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1';
const MODEL = 'gemini-2.0-flash';

const testQuestions = [
  '¿Qué productos sirven para la digestión?',
  '¿Tengo problemas de piel, qué me recomiendas?',
  '¿Qué es bueno para fortalecer huesos y articulaciones?'
];

async function testQuestion(question) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  try {
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

    console.log('\n' + '═'.repeat(70));
    console.log('❓ ' + question);
    console.log('═'.repeat(70));
    console.log(response.text);
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         PRUEBAS MÚLTIPLES - OMNILIFE RAG CHAT                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  for (const question of testQuestions) {
    await testQuestion(question);
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Pruebas completadas\n');
}

main();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      PRUEBA CON PREGUNTAS ESPECÍFICAS SOBRE OMNILIFE      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`\n[${i + 1}/${questions.length}] ❓ ${question}`);
    console.log('─'.repeat(60));

    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: question + ' Proporciona información específica de los productos Omnilife.',
        tools: [
          {
            googleSearch: {},
            fileSearch: {
              fileSearchStoreNames: [RAG_STORE],
            },
          },
        ],
      });

      console.log('📝 ' + response.text.substring(0, 400) + '...\n');

      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  console.log('═'.repeat(60));
  console.log('✅ Prueba completada\n');
}

testMultipleQuestions();
