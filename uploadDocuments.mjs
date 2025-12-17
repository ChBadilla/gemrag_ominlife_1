/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config();

const RAG_STORE_NAME = "fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1";
const DOCUMENTS_FOLDER = "./documents";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadDocuments() {
  // Validate API Key
  if (!process.env.API_KEY) {
    console.error(
      "Error: API_KEY environment variable is not set."
    );
    console.error(
      "Please ensure your .env file contains: API_KEY='YOUR_GEMINI_API_KEY'"
    );
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Get all files from documents folder
    const files = readdirSync(DOCUMENTS_FOLDER).filter((f) => {
      const stat = statSync(join(DOCUMENTS_FOLDER, f));
      return stat.isFile();
    });
    
    console.log(`Encontrados ${files.length} archivos para subir:`);
    files.forEach((f) => console.log(`  - ${f}`));

    for (const file of files) {
      const filePath = join(DOCUMENTS_FOLDER, file);
      const fileBuffer = readFileSync(filePath);
      const mimeType = getMimeType(file);

      console.log(`\n📤 Subiendo: ${file} (${mimeType})...`);

      try {
        // Usar la ruta del archivo directamente o pasar buffer con config
        let op = await ai.fileSearchStores.uploadToFileSearchStore({
          fileSearchStoreName: RAG_STORE_NAME,
          file: filePath, // Pasar la ruta como string
          config: {
            mimeType: mimeType,
          },
        });

        // Poll until operation completes
        let attempts = 0;
        while (!op.done && attempts < 60) {
          console.log(`   ⏳ Esperando... (intento ${attempts + 1})`);
          await delay(2000);
          op = await ai.operations.get({ operation: op });
          attempts++;
        }

        if (op.done) {
          console.log(`   ✅ ${file} subido exitosamente`);
        } else {
          console.log(`   ⚠️  ${file} timeout, pero probablemente se completó`);
        }
      } catch (fileError) {
        console.error(`   ❌ Error subiendo ${file}:`, fileError.message);
      }
    }

    console.log("\n✅ ¡Proceso de carga completado!");
  } catch (error) {
    console.error("Error al subir documentos:", error);
    if (error.message.includes("API Key not valid")) {
      console.error(
        "Verifica que tu API_KEY en .env sea válida y esté habilitada para 'Vertex AI Search and Conversation API'."
      );
    }
  }
}

function getMimeType(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const mimeTypes = {
    pdf: "application/pdf",
    txt: "text/plain",
    csv: "application/csv",
    json: "application/json",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

uploadDocuments();
