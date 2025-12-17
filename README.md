# SaludNatural360 - Asistente RAG de Productos Omnilife

Aplicación de chat con IA que utiliza RAG (Retrieval-Augmented Generation) para responder preguntas sobre productos Omnilife, integrada con el sistema de diseño de SaludNatural360.

## 🌿 Características

- **Chat con IA**: Interfaz conversacional para consultas sobre productos
- **RAG (Retrieval-Augmented Generation)**: Respuestas basadas en documentación real de productos
- **Diseño SaludNatural360**: Paleta de colores y tipografía de marca
- **Sugerencias automáticas**: Preguntas de ejemplo generadas por IA
- **Fuentes citadas**: Referencias a documentos fuente en cada respuesta
- **Embebible**: Puede integrarse como iframe en otras aplicaciones

## 🎨 Sistema de Diseño

La aplicación utiliza el sistema de diseño de **SaludNatural360**:

### Paleta de Colores
| Color | Hex | Uso |
|-------|-----|-----|
| Verde Eucalipto | `#5E8F7B` | Color primario de marca |
| Sage Claro | `#A7C4B5` | Acentos suaves |
| Azul Cielo | `#6FB1D6` | Elementos físicos |
| Lavanda | `#B5A7E1` | Elementos espirituales |
| Arena | `#F4EFE9` | Fondo base |
| Carbón | `#2E3A3A` | Texto principal |

### Tipografía
- **Titulares**: Manrope (600-800)
- **Cuerpo**: Inter (400-600)

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/ChBadilla/gemrag_ominlife_1.git
cd gemrag_ominlife_1

# Instalar dependencias
npm install
```

## ⚙️ Configuración

1. Crear archivo `.env` en la raíz del proyecto:

```env
API_KEY=tu_api_key_de_gemini
```

2. Configurar el RAG Store en `App.tsx`:

```typescript
const DEFAULT_RAG_STORE_NAME = "fileSearchStores/tu-rag-store-name";
const DEFAULT_CHAT_DISPLAY_NAME = "Nombre del Asistente";
```

## 🏃 Ejecución

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
omni_rag/
├── App.tsx                 # Componente principal
├── index.html              # HTML con configuración Tailwind
├── index.css               # Variables CSS y clases utilitarias
├── types.ts                # Definiciones de tipos TypeScript
├── components/
│   ├── ChatInterface.tsx   # Interfaz de chat principal
│   ├── ProgressBar.tsx     # Barra de progreso
│   ├── Spinner.tsx         # Indicador de carga
│   └── icons/              # Iconos SVG
├── services/
│   └── geminiService.ts    # Servicio de integración con Gemini API
└── documents/              # Documentos para el RAG store
```

## 🔧 Tecnologías

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos utilitarios
- **Google Gemini API** - Modelo de IA y RAG

## 📨 Comunicación con iframe (Modo Embebido)

La aplicación puede recibir mensajes del padre:

```typescript
// Inicializar chat
window.postMessage({
  type: 'initChat',
  payload: {
    ragStoreResourceName: 'fileSearchStores/...',
    chatDisplayName: 'Asistente de Productos'
  }
}, '*');

// Enviar mensaje
window.postMessage({
  type: 'sendMessage',
  payload: { message: '¿Qué productos ayudan con la energía?' }
}, '*');

// Resetear chat
window.postMessage({ type: 'resetChat' }, '*');
```

Eventos emitidos al padre:
- `chatReady` - Chat inicializado
- `chatResponse` - Respuesta del modelo
- `chatError` - Error ocurrido
- `chatEnded` - Chat terminado

## 📄 Licencia

Apache-2.0

---

Desarrollado para **SaludNatural360.shop** - "Asesoría con IA, decisiones humanas."
