# Omni RAG - Gemini Code Assist Instructions

## Project Overview
This is a React+TypeScript frontend application for an **AI-powered RAG (Retrieval-Augmented Generation) chat assistant** using Google Gemini API. The app provides document search capabilities via pre-created RAG stores and embeds in iframes for iframe-based deployment.

**Key Stack:**
- Frontend: React 18 + TypeScript
- Backend Service: Gemini 2.0 Flash API (via `@google/genai`) - Updated after testing
- Data Layer: Google Vertex AI FileSearchStores (persistent RAG document stores)
- Build: Node.js ESM module support

**Active RAG Store (OMNILIFE PRODUCTS):**
- Store ID: `fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1`
- Status: ✅ Active with 6 documents loaded
- Documents: 4 TXT files + 2 PDFs (Omnilife product catalogs)

---

## Architecture

### Data Flow
1. **RAG Store Creation** (`createRagStore.mjs`): Node script that creates persistent Gemini FileSearchStores from Vertex AI API
2. **App Initialization** (`App.tsx`): React app connects to a pre-existing RAG store via `ragStoreResourceName`
3. **Chat Flow**:
   - User sends message via `ChatInterface`
   - `geminiService.fileSearch()` queries the RAG store using Gemini's file search tool
   - Grounding chunks (document references) are returned alongside AI responses
   - Messages flow through iframe postMessage for parent/child communication

### Key Components
- **`App.tsx`**: Main orchestrator—initializes chat, manages state (status, chat history, error), coordinates between services and UI
- **`services/geminiService.ts`**: Gemini API wrapper (`initialize`, `fileSearch`, `uploadToRagStore`, `createRagStore`)
- **`components/ChatInterface.tsx`**: Displays chat messages and user input
- **`types.ts`**: Defines strict TypeScript interfaces for messages, RAG stores, and inter-window communication

### Critical Design Pattern: PostMessage Communication
The app uses iframe `postMessage` for parent-child window communication:
- **Parent → Child**: `InitChatPayload` (start chat with RAG store) or `SendMessagePayload` (user message)
- **Child → Parent**: `ChatResponsePayload` (AI response), `ChatErrorPayload`, `ChatReadyPayload`

All message types are defined in `types.ts` and dispatched via `postMessageToParent()` callback.

---

## Essential Conventions

### Environment Setup
- **`.env` file required** with `API_KEY=<Gemini API key>` and optionally `PROJECT_ID`, `LOCATION`
- Gemini API key must have "Vertex AI Search and Conversation API" enabled
- **Active RAG store:** `fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1` (configured in `App.tsx`)

### Testing & Validation Scripts
- **`testRAGSimple.mjs`**: Single query test to verify RAG integration
- **`testRAGChat.mjs`**: Interactive chat mode for manual testing
- **`demoRAG.mjs`**: Automated demo with 3 predefined questions
- **`listDocuments.mjs`**: List documents in current RAG store
- **`uploadDocuments.mjs`**: Batch upload files from `/documents` folder
- **`generateProductsPDF.mjs`**: Generate formatted PDF from product data

### State Management Pattern
- No Redux/Context API—local React state only
- `AppStatus` enum drives UI rendering: `Initializing → Chatting → Error`
- Chat history stored as `ChatMessage[]` with `role: 'user' | 'model'` and `parts: { text }[]`

### Grounding References (Citations)
- Gemini responses include `groundingChunks[]` containing retrieved document context
- Each chunk has structure: `{ retrievedContext: { text: string } }`
- Always display grounding chunks when available (see `ChatInterface` for rendering pattern)

### Gemini Model Selection
- Currently uses `gemini-2.0-flash` (latest fast model for v1beta API)
- FileSearch tool is mandatory for RAG queries—model must have access to the RAG store
- Prompt includes: *"DO NOT ASK THE USER TO READ THE MANUAL, pinpoint the relevant sections"*
- **CRITICAL**: Tools must be at root level, not inside `config`:
  ```typescript
  tools: [
    {
      googleSearch: {},
      fileSearch: {
        fileSearchStoreNames: [ragStoreName],
      },
    },
  ],
  ```
- Grounding metadata may not be exposed in response.candidates; responses still contain RAG data

---

## Development Workflow

### Setup
```bash
npm install
# Ensure .env has API_KEY and PROJECT_ID
```

### Create a New RAG Store
```bash
node createRagStore.mjs
# Returns: fileSearchStores/projects/{PROJECT_ID}/locations/{LOCATION}/fileSearchStores/{STORE_ID}
# Copy this resource name to App.tsx DEFAULT_RAG_STORE_NAME
```

### Run Development Server
```bash
npm start
# Runs createRagStore.mjs (Node-only script, not the React app)
```

### Key Debugging Patterns
- Check browser console for iframe `postMessage` communication errors
- `geminiService.initialize()` must be called before any API calls—add logging to verify
- If RAG store queries fail: verify `ragStoreResourceName` format and API key permissions

---

## Common Patterns to Follow

### Adding New Chat Features
1. Define new message types in `types.ts` (add to `ParentMessage` union)
2. Update `App.tsx` message handler and `postMessageToParent` calls
3. Update `ChatInterface.tsx` to render new response types

### Error Handling
- Use `handleError(message, err)` in `App.tsx` to set error state
- Always catch async Gemini API calls (`fileSearch`, `uploadToRagStore`) with try/catch
- Display user-friendly error messages via `ChatErrorPayload`

### Gemini API Extensions
- New RAG operations (e.g., delete store) go in `geminiService.ts`
- Wrap all API calls with error checks (`if (!ai) throw...`)
- Add delay retry logic for long-running operations (see `uploadToRagStore` pattern)

---

## Important Notes for AI Agents

- **No build step**: This is a React app but relies on external bundler (Vite/Webpack in parent project)
- **Persistent stores**: RAG stores are NOT deleted on app unload—they persist on Google servers
- **Iframe context**: App may have restricted DOM access if embedded; use `window.parent.postMessage` for cross-window communication
- **Gemini API versioning**: Monitor `@google/genai` updates for breaking changes in FileSearch API
- **RAG Upload Quirks**: Files must use correct MIME types in config; CSV needs `application/csv` not `text/csv`
- **See SETUP_COMPLETE.md** for detailed setup report and current status
