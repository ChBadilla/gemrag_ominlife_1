/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const RAG_STORE_NAME = "fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1";

async function listDocuments() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║   LISTANDO DOCUMENTOS EN EL RAG STORE                     ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log(`📦 RAG Store: ${RAG_STORE_NAME}\n`);
    console.log("⏳ Obteniendo lista de documentos...\n");

    // Listar documentos en el store
    const response = await ai.fileSearchStores.list({
      name: RAG_STORE_NAME,
    });

    if (response.documents && response.documents.length > 0) {
      console.log(`✅ Se encontraron ${response.documents.length} documentos:\n`);

      response.documents.forEach((doc, idx) => {
        console.log(`[${idx + 1}] ${doc.displayName || doc.name}`);
        console.log(`    Nombre: ${doc.name}`);
        if (doc.customMetadata) {
          console.log(`    Metadata: ${JSON.stringify(doc.customMetadata)}`);
        }
        console.log();
      });
    } else {
      console.log("⚠️  No se encontraron documentos en el RAG Store");
    }

    console.log("═".repeat(60));
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Detalles:", error.response);
    }
  }
}

listDocuments();
