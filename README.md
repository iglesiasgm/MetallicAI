# 🤘 MetallicAI - Backend API

API de recomendación de música Metal potenciada por Inteligencia Artificial (Google Gemini).
El sistema utiliza **Búsqueda Vectorial (Embeddings)** para encontrar similitud matemática entre los gustos del usuario y el catálogo, y **IA Generativa** para explicar el porqué de cada recomendación.

## 🚀 Tecnologías

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify (Servidor HTTP rápido y ligero)
- **AI Core:** Google Gemini (`text-embedding-004` para vectores, `gemini-2.5-flash` para chat)
- **Algoritmo:** Similitud del Coseno (Custom implementation) y Jaccard Strategy
- **Storage:** Qdrant Vector DB

## 🛠️ Requisitos Previos

1. [Docker](https://www.docker.com/) y Docker Compose.
2. [Node.js](https://nodejs.org/) (versión LTS recomendada).
3. pnpm (recomendado) o npm.
4. Una **API Key** de [Google AI Studio](https://aistudio.google.com/).

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
 ### Base de datos

 Utiliza Docker Compose para iniciar el servicio de BD (Qdrant)

 ```bash
 # Levantar los servicios en segundo plano
docker-compose up -d
```

## Procedimientos Auxiliares

### Migracion de datos a la BD

Una vez configurada la BD, y las dependencias instaladas `npm install`, ejecuta el script para migrar la estructura y cargar los datos iniciales:

 ```bash
pnpm --filter api exec ts-node src/scripts/seed-db.ts
```

El dashboard de la BD estara disponible desde:
`http://localhost:6333/dashboard#/datasets`

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

- `GET /bands`
  Endpoint para traer todas las bandas disponibles.
  
- `GET /bands:id`
  Endpoint para obtener todos los datos de una banda seleccionada
  **Respuesta (JSON)**:

```JSON
{
  "id":"1",
  "name":"Gojira",
  "subgenres":["Technical Death Metal","Groove Metal"],
  "moods":["Heavy","Ecological","Spiritual"],
  "features":["Pick Scrapes","Double Bass","Chugging Riffs"],
  "description":"French metal giants known for their precise rhythm and heavy, atmospheric soundscapes."
}
```


## 📂 Estructura del proyecto (BACKEND)

api
├── 📂 src
│   ├── 📂 config           # Configuración de envs y conexión a DB
│   │   └── envs.ts     # Variables de entorno
│   ├── 📂 domain           # Definición de esquemas de Base de Datos
│   │   └── types.ts
│   ├── 📂 services         # Lógica de negocio pura
│   │   ├── openai.service.ts       # Comunicación con API de IA (Embeddings)
│   │   └── recommendation.service.ts # Lógica de similitud de cosenos y Jaccard
│   ├── 📂 utils
│   │   └── math.ts         # Cálculos vectoriales
│   ├── 📂 scripts          # Scripts de mantenimiento
│   │   └── seed-db.ts # Migración: JSON -> Base de Datos
│   │   └── check-models.ts # Verificacion de modelos disponibles para la API KEY brindada
│   ├── 📂 data          # Archivos estáticos / Seeds
│   │   └── bands.json          # Datos semilla originales
│   └── main.ts             # Punto de entrada del servidor

