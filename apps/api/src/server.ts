// apps/api/src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import * as path from "path";
import { QdrantClient } from "@qdrant/js-client-rest";

import { GeminiService } from "./services/gemini.service";
import { SpotifyService } from "./services/spotify.service";
import { RecommendationService } from "./services/recommendation.service";
import { UserInput } from "./domain/types";

import { BandSubmissionsStore } from "./stores/bandSubmissions.store";

import { bandSubmissionsRoutes } from "./routes/bandSubmissions.routes";
import { adminModerationRoutes } from "./routes/adminModeration.routes";
import { UsersStore } from "./stores/users.store";
import { authRoutes } from "./routes/auth.routes";
import { authPlugin } from "./plugins/auth";
import { register } from "module";

export async function buildServer() {
  const server = Fastify({ logger: true });
  await server.register(cors, { origin: "*" });

  // Services
  const spotifyService = new SpotifyService();
  const aiService = new GeminiService();
  const qdrant = new QdrantClient({ url: "http://localhost:6333" });

  // Ensure Qdrant collection exists
  const COLLECTION = "bands";
  async function ensureBandsCollection() {
    const collections = await qdrant.getCollections();
    const exists = collections.collections?.some(
      (c: any) => c.name === COLLECTION
    );

    if (!exists) {
      await qdrant.createCollection(COLLECTION, {
        vectors: { size: 768, distance: "Cosine" },
      });

      await qdrant.createPayloadIndex(COLLECTION, {
        field_name: "name",
        field_schema: "text",
      });

      console.log(`✅ Qdrant collection '${COLLECTION}' created`);
    }
  }
  await ensureBandsCollection();

  // Recommender
  const recommender = new RecommendationService(aiService, qdrant);

  // Storage paths
  const dataPath = path.resolve(__dirname, "data", "bands.json");
  const submissionsPath =
    process.env.SUBMISSIONS_FILE_PATH ||
    path.resolve(process.cwd(), "apps/api/var/band-submissions.json");

  const store = new BandSubmissionsStore({ filePath: submissionsPath });

  // Base routes
  server.get("/", async () => ({
    status: "online",
    db: "Qdrant Vector Database",
  }));

  server.post<{ Body: UserInput }>("/recommend", async (request) => {
    const recommendations = await recommender.getRecommendations(request.body);
    return { recommendations };
  });

  // Tus GET /bands y /bands/:id (copiá los mismos que tenías)
  server.get<{
    Querystring: { page?: number; limit?: number; search?: string };
  }>("/bands", async (request, reply) => {
    const limit = Number(request.query.limit) || 20;
    const page = Number(request.query.page || 1);
    const offset = (page - 1) * limit;

    const filter = request.query.search
      ? { should: [{ key: "name", match: { text: request.query.search } }] }
      : undefined;

    try {
      const result = await qdrant.scroll("bands", {
        limit,
        offset: offset as any,
        filter,
        with_vector: false,
        with_payload: true,
      });

      return result.points.map((p) => ({
        id: p.id,
        ...(p.payload as any),
      }));
    } catch (error) {
      console.error("Error fetching from Qdrant:", error);
      return reply.code(500).send({ error: "Database connection failed" });
    }
  });

  server.get<{ Params: { id: string } }>(
    "/bands/:id",
    async (request, reply) => {
      const { id } = request.params;
      const parsedId = /^\d+$/.test(id) ? Number(id) : id;

      const result = await qdrant.retrieve("bands", {
        ids: [parsedId],
        with_vector: false,
        with_payload: true,
      });

      if (!result || result.length === 0) {
        return reply.code(404).send({ error: "Band not found" });
      }

      const point = result[0];
      return reply.send({
        id: String(point.id),
        ...(point.payload ?? {}),
      });
    }
  );

  const usersPath =
    process.env.USERS_FILE_PATH ||
    path.resolve(process.cwd(), "apps/api/var/users.json");

  const usersStore = new UsersStore({ filePath: usersPath });

  await usersStore.seedIfEmpty([
    {
      username: "La Bestia Pop",
      role: "ADMIN",
      password: process.env.ADMIN1_PASSWORD ?? "bestia123",
    },
    {
      username: "WindsOfMayhem",
      role: "ADMIN",
      password: process.env.ADMIN2_PASSWORD ?? "mayhem123",
    },
    {
      username: "usuario_test",
      role: "USER",
      password: process.env.USER_TEST_PASSWORD ?? "test123",
    },
  ]);

  // ✅ Auth plugin ANTES que las rutas que lo usan
  await server.register(authPlugin, { usersStore });
  await server.register(authRoutes);

  // ✅ Ahora sí: rutas submissions (ya existe authenticate/requireRole)
  await server.register(bandSubmissionsRoutes, { store, qdrant });
  await server.register(adminModerationRoutes, {
    store,
    qdrant,
    aiService,
    spotifyService,
    dataPath,
  });

  return server;
}
