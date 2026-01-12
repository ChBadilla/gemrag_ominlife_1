/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const PROJECT_ID = process.env.PROJECT_ID || 'sn360-asist'; // Use your actual project ID
const LOCATION = process.env.LOCATION || 'global'; // Or your specific region, 'global' is common for FileSearch

async function main() {
    // Validate API Key
    if (!process.env.API_KEY) {
        console.error("Error: API_KEY environment variable is not set.");
        console.error("Please ensure your .env file in the same directory contains: API_KEY='YOUR_GEMINI_API_KEY'");
        return;
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const displayName = "Documentos Omnilife SN360"; // The display name for your RAG store

    console.log(`Intentando crear un FileSearchStore con displayName: "${displayName}" en el proyecto ${PROJECT_ID}...`);

    try {
        // Ensure the GoogleGenAI instance is correctly configured for Vertex AI Search and Conversation API
        // For FileSearchStores, the 'name' parameter for create() expects the project and location context.
        // The SDK handles this when you call ai.fileSearchStores.create directly.
        const ragStore = await ai.fileSearchStores.create({
            parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
            config: { displayName: displayName },
        });

        if (!ragStore.name) {
            throw new Error("Failed to create RAG store: name is missing from response.");
        }

        console.log("¡FileSearchStore creado con éxito!");
        console.log(`Nombre de recurso completo del almacén RAG: ${ragStore.name}`);
        console.log("\nPor favor, guarda este nombre de recurso para usarlo en tu aplicación frontend (ragStoreResourceName).");

    } catch (error) {
        console.error("Error al crear el FileSearchStore:", error);
        if (error.message.includes("API Key not valid")) {
            console.error("Verifica que tu API_KEY en el archivo .env sea válida y esté habilitada para la 'Vertex AI Search and Conversation API'.");
        } else if (error.message.includes("Permission denied") || error.message.includes("caller does not have permission")) {
            console.error("Verifica que la cuenta de servicio asociada a tu API_KEY tenga los permisos necesarios (por ejemplo, 'Vertex AI User' o 'Editor') para el proyecto y la API de Vertex AI Search and Conversation.");
            console.error("Asegúrate también de que la 'Vertex AI Search and Conversation API' esté habilitada en tu proyecto de Google Cloud.");
        } else if (error.message.includes("Please provide the project ID")) {
            console.error("Asegúrate de que el PROJECT_ID en el script o en tu variable de entorno sea correcto.");
        }
    }
}

main();