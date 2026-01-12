# GUÍA PARA INICIAR PRUEBAS DE INTERFAZ

## Estado Actual

✅ RAG integrado en `services/geminiService.ts`  
✅ Prompt mejorado implementado  
✅ Modelos y tools configurados  
✅ Documentos del RAG Store cargados

## Cómo Iniciar las Pruebas

### Opción 1: Si React está en este proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

Luego abrir en navegador:
- `http://localhost:3000`
- `http://localhost:5173` (si es Vite)

### Opción 2: Si React está en proyecto padre

Este proyecto (`SN360Asist`) contiene:
- ✅ `App.tsx` - Componente React principal
- ✅ `services/geminiService.ts` - Integración RAG actualizada
- ✅ `components/` - Interfaz de usuario
- ✅ `types.ts` - Tipos TypeScript

Se espera que esté integrado en un proyecto padre con configuración de bundler (Vite/Webpack).

**Pasos:**
1. Ir a proyecto padre
2. Ejecutar `npm install` en raíz
3. Ejecutar `npm start` o `npm run dev`
4. La aplicación cargará con `App.tsx` actualizado

## Qué Probar

### 1. Inicialización del Chat
- La app debe inicializarse con el RAG Store
- Se deben mostrar preguntas sugeridas en español

### 2. Envío de Preguntas
Prueba estas preguntas:

```
1. "¿Qué producto es bueno para bajar el colesterol?"
   → Debe devolver: Fiber'N Plus, Omniplus, Dolce Vita, Cafezzino

2. "¿Tengo mucho sueño y debo trabajar, qué puedo tomar?"
   → Debe devolver: Magnus, Optimus, Starbien

3. "¿Qué es bueno para la potencia sexual?"
   → Debe devolver: Power Maker, Homo Plus, Omniplus, One C Mix, Cafezzino

4. "¿Qué productos sirven para la digestión?"
   → Debe devolver: Fiber'N Plus, Aloe Beta, Probiotic, Omniplus, Dolce Vita

5. "¿Tengo problemas de piel, qué me recomiendas?"
   → Debe devolver: Omniplus Gel, Aqtúa, C Mix, Ego Frutas, Fem Plus, Homo Plus, Cafezzino, Teatino
```

### 3. Validar Respuestas
Verificar que cada respuesta tenga:
- ✅ Disclaimer médico UNA sola vez al inicio
- ✅ Tono comercial y positivo
- ✅ Productos específicos recomendados
- ✅ Beneficios principales para cada producto
- ✅ Modo de uso claro
- ✅ SIN información de marca innecesaria
- ✅ Respuesta concisa y directa

### 4. Preguntas Sugeridas
- Las preguntas deben aparecer en español
- Deben ser clickeables
- Al hacer click deben enviar la pregunta automáticamente

## Estructuras de Archivos

```
SN360Asist/
├── App.tsx (✅ Actualizado)
├── services/
│   └── geminiService.ts (✅ Actualizado con prompt mejorado)
├── components/
│   ├── ChatInterface.tsx
│   ├── ProgressBar.tsx
│   └── Spinner.tsx
├── types.ts
└── index.css
```

## Configuración

**.env (debe existir en raíz del proyecto):**
```
API_KEY=tu_gemini_api_key_aqui
PROJECT_ID=tu_project_id_opcional
LOCATION=us-central1
```

**RAG Store (ya configurado):**
```
Store ID: fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1
Documentos: 6 archivos cargados
```

## Solución de Problemas

### Si la app no inicia:
```bash
# Limpiar node_modules
rm -r node_modules
npm install

# Limpiar cache si es necesario
npm cache clean --force
```

### Si las preguntas no aparecen:
- Verificar que el RAG Store ID es correcto
- Verificar que la API Key está configurada
- Ver consola del navegador para errores

### Si las respuestas son incorrectas:
- Verificar que el modelo es `gemini-2.0-flash`
- Verificar que los tools están configurados (googleSearch + fileSearch)
- Revisar el prompt del sistema en `geminiService.ts`

## Próximos Pasos Después de Validar

1. ✅ Pruebas de UI completas
2. ✅ Validar respuestas por cada categoría
3. ✅ Ajustar UI/UX si es necesario
4. ✅ Deploy de la aplicación

---

**Estado:** Listo para iniciar pruebas ✅
