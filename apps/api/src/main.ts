import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { QdrantClient } from "@qdrant/js-client-rest";
import { GeminiService } from "./services/gemini.service";
import { RecommendationService } from "./services/recommendation.service";
import { CreateBandInput, UserInput, Band } from "./domain/types";
import path from "path/win32";
import { SpotifyService } from "./services/spotify.service";
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const server = Fastify({ logger: true });

  try {
    await server.register(cors, { origin: "*" });

    const dataPath = path.resolve(__dirname, 'data', 'bands.json');
    const cachePath = path.resolve(__dirname, 'data', 'bands-with-vectors.json');
    const spotifyService = new SpotifyService();
    const aiService = new GeminiService();
    const qdrant = new QdrantClient({ url: "http://localhost:6333" });
    const recommender = new RecommendationService(aiService, qdrant);
    let bands: Band[] = [];
    if (fs.existsSync(cachePath)) {
        bands = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    } else if (fs.existsSync(dataPath)) {
        bands = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

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
    });

    server.get<{ Params: { id: string } }>(
      "/bands/:id",
      async (request, reply) => {
        const { id } = request.params;
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
          return reply.code(400).send({ error: "Invalid ID" });
        }

        const result = await qdrant.retrieve("bands", {
          ids: [numericId],
          with_vector: false,
        });

        if (result.length === 0) {
          return reply.code(404).send({ error: "Band not found" });
        }

        return { id: result[0].id, ...result[0].payload };
      }
    );

    server.post<{ Body: CreateBandInput }>('/bands', async (request, reply) => {
      const input = request.body;

      const spotifyUrl = input.links?.find(link => link.spotify)?.spotify;

      if (!input.name || !input.description || !spotifyUrl) {
        return reply.code(400).send({ error: 'Missing required fields' });
      }

      try {
        const spotifyData = await spotifyService.getBandDetails(spotifyUrl);

        if (!spotifyData) {
          return reply.code(404).send({ error: 'Band not found on Spotify' });
        }

        const membersStr = input.members.map(m => `${m.name} (${m.role})`).join(', ');
        
        const context = `Band: ${input.name}. Description: ${input.description}. Genres: ${input.subgenres.join(', ')}. Moods: ${input.moods.join(', ')}. Features: ${input.features.join(', ')}. Members: ${membersStr}.`;
        
        const embedding = await aiService.getEmbedding(context);

        const newBand: Band = {
          id: uuidv4(),
          name: input.name,
          subgenres: input.subgenres,
          moods: input.moods,
          features: input.features,
          description: input.description,
          members: input.members,
          links: input.links,
          imageUrl: spotifyData.imageUrl ?? undefined,
          popularity: spotifyData.popularity,
          embedding
        };

        bands.push(newBand);

        const cleanBands = bands.map(({ embedding, ...rest }) => rest);
        fs.writeFileSync(dataPath, JSON.stringify(cleanBands, null, 2));
        fs.writeFileSync(cachePath, JSON.stringify(bands, null, 2));

        const { embedding: _, ...bandResponse } = newBand;
        
        return reply.code(201).send({ 
          message: 'Band created successfully', 
          band: bandResponse 
        });

      } catch (error: any) {
        console.error(error);
        return reply.code(500).send({ 
          error: 'Internal Server Error', 
          details: error.message 
        });
      }
    });

    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Server running");
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

bootstrap();
