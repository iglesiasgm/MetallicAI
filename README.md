# 🤘 MetallicAI - Backend API

API de recomendación de música Metal potenciada por Inteligencia Artificial (Google Gemini).
El sistema utiliza **Búsqueda Vectorial (Embeddings)** para encontrar similitud matemática entre los gustos del usuario y el catálogo, y **IA Generativa** para explicar el porqué de cada recomendación.

## 🚀 Tecnologías

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify (Servidor HTTP rápido y ligero)
- **AI Core:** Google Gemini (`text-embedding-004` para vectores, `gemini-2.5-flash` para chat)
- **Algoritmo:** Similitud del Coseno (Custom implementation)

## 🛠️ Requisitos Previos

1. Node.js (v18 o superior).
2. pnpm (recomendado) o npm.
3. Una **API Key** de [Google AI Studio](https://aistudio.google.com/).

## ⚙️ Configuración e Instalación

1. **Instalar dependencias:**
    Desde la raíz del monorepo:

    ```bash
    pnpm install
    ```

2. **Configurar Variables de Entorno:**
    Crea un archivo `.env` dentro de `apps/api/`:
    ```env
    # apps/api/.env
    GEMINI_API_KEY=tu_clave_de_google_aqui
    ```

## ▶️ Ejecución

### Modo Desarrollo

Levanta el servidor en el puerto `3001` con recarga automática (hot-reload).

```bash
pnpm --filter api run dev
```

#### Nota sobre el Cache: La primera vez que inicies, el sistema tardará unos segundos en generar los vectores para todas las bandas. Se creará automáticamente un archivo bands-with-vectors.json en apps/api/src/data. Los siguientes arranques serán instantáneos leyendo desde ahí

## 💡 Chequeo de Modelos (Utilidad)

### Chequeo de modelos (Utilidad)

Para ver los modelos disponibles para tu API KEY

```bash
pnpm --filter api exec ts-node src/check-models.ts
```

## 🔌 API Endpoints

- `GET /`
  Health check para verificar si la API responde.
  Respuesta: { "status": "online", "bandsLoaded": 12 }

- `POST /recommend`
  Endpoint principal para obtener recomendaciones.

**Body (JSON)**:

```JSON
{
  "favoriteBands": ["Metallica", "Iron Maiden"],
  "targetMood": "Quiero algo atmosférico, lento y muy pesado, estilo doom metal"
}'
```

**Respuesta (JSON)**:

```JSON
{
  "recommendations": [
    {
      "band": {
        "name": "Black Sabbath",
        "subgenres": ["Heavy Metal", "Doom Metal"],
        ...
      },
      "score": 0.8921,
      "explanation": "Te recomiendo Black Sabbath porque inventaron el sonido pesado y lento que buscas para tu mood doom metal."
    },
    ...
  ]
}
```

## 📂 Estructura del proyecto

- `src/data/bands.json`: Catálogo maestro de bandas.
- `src/services/gemini.service.ts`: Comunicación con Google AI.
- `src/services/recommendation.service.ts`: Lógica de filtrado y ranking.
- `src/utils/math.ts`: Cálculo matemático de vectores.
- `src/main.ts`: Punto de entrada del servidor Fastify.
