import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { QdrantClient } from "@qdrant/js-client-rest";

import { GeminiService } from "./services/gemini.service";
import { SpotifyService } from "./services/spotify.service";
import { RecommendationService } from "./services/recommendation.service";
import { UserInput, CreateBandInput, Band } from "./domain/types";

async function bootstrap() {
  const server = Fastify({ logger: true });

  try {
    await server.register(cors, { origin: "*" });

    const dataPath = path.resolve(__dirname, "data", "bands.json");

    // Services
    const spotifyService = new SpotifyService();
    const aiService = new GeminiService();
    const qdrant = new QdrantClient({ url: "http://localhost:6333" });

    // Initialize recommender with Qdrant
    const recommender = new RecommendationService(aiService, qdrant);

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

    server.get("/", async () => {
      return { status: "online", db: "Qdrant Vector Database" };
    });

    server.post<{ Body: UserInput }>("/recommend", async (request, reply) => {
      const userInput = request.body;
      const recommendations = await recommender.getRecommendations(userInput);
      return { recommendations };
    });

    server.get<{
      Querystring: { page?: number; limit?: number; search?: string };
    }>("/bands", async (request, reply) => {
      const limit = Number(request.query.limit) || 20;
      const page = Number(request.query.page || 1);
      const offset = (page - 1) * limit;

      const filter = request.query.search
        ? {
            should: [{ key: "name", match: { text: request.query.search } }],
          }
        : undefined;

      try {
        const result = await qdrant.scroll("bands", {
          limit: limit,
          offset: offset as any,
          filter: filter,
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

    server.post<{ Body: CreateBandInput }>("/bands", async (request, reply) => {
      const input = request.body;
      const spotifyUrl = input.links?.find((l) => l.spotify)?.spotify;

      if (!input.name || !input.description || !spotifyUrl) {
        return reply.code(400).send({ error: "Missing required fields" });
      }

      try {
        console.log(`Processing creation for: ${input.name}`);

        // 1. Get Spotify Data
        const spotifyData = await spotifyService.getBandDetails(spotifyUrl);
        if (!spotifyData) {
          return reply.code(404).send({ error: "Band not found on Spotify" });
        }

        // 2. Get Embedding
        const membersStr =
          input.members?.map((m) => `${m.name} (${m.role})`).join(", ") || "";
        const context = `Band: ${input.name}. Description: ${
          input.description
        }. Genres: ${input.subgenres.join(", ")}. Moods: ${input.moods.join(
          ", "
        )}. Features: ${input.features.join(", ")}. Members: ${membersStr}`;

        const embedding = await aiService.getEmbedding(context);

        const newBandId = uuidv4();

        // 3. Construct Payload
        const bandPayload = {
          name: input.name,
          subgenres: input.subgenres,
          moods: input.moods,
          features: input.features,
          description: input.description,
          members: input.members || [],
          links: input.links || [{ spotify: spotifyData.url }],
          imageUrl: spotifyData.imageUrl ?? undefined,
          popularity: spotifyData.popularity,
        };

        // 4. Save to Qdrant (Primary DB)
        await qdrant.upsert("bands", {
          wait: true,
          points: [
            {
              id: newBandId,
              vector: embedding,
              payload: bandPayload,
            },
          ],
        });

        // 5. Save to bands.json (Backup/Migration)
        const backupBand = { id: newBandId, ...bandPayload };
        let currentJsonBands = [];

        if (fs.existsSync(dataPath)) {
          const fileContent = fs.readFileSync(dataPath, "utf-8");
          currentJsonBands = fileContent ? JSON.parse(fileContent) : [];
        }

        currentJsonBands.push(backupBand);
        fs.writeFileSync(dataPath, JSON.stringify(currentJsonBands, null, 2));

        console.log(
          `Band ${input.name} created successfully in Qdrant and backed up to JSON.`
        );

        return reply.code(201).send({
          message: "Band created successfully",
          band: { id: newBandId, ...bandPayload },
        });
      } catch (error: any) {
        console.error(error);
        return reply.code(500).send({
          error: "Internal Server Error",
          details: error.message,
        });
      }
    });

    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3001");
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

bootstrap();
