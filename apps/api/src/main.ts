import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GeminiService } from './services/gemini.service';
import { RecommendationService } from './services/recommendation.service';
import { UserInput } from './domain/types';

async function bootstrap() {
  const server = Fastify({ logger: true });

  try {
    await server.register(cors, { origin: '*' });

    const aiService = new GeminiService();
    const qdrant = new QdrantClient({ url: 'http://localhost:6333' });
    
    const recommender = new RecommendationService(aiService, qdrant);

    server.get('/', async () => { 
      return { status: 'online', db: 'Qdrant Vector Database' }; 
    });

    server.post<{ Body: UserInput }>('/recommend', async (request, reply) => {
      const userInput = request.body;
      const recommendations = await recommender.getRecommendations(userInput);
      return { recommendations };
    });

    server.get<{ Querystring: { page?: number; limit?: number; search?: string } }>('/bands', async (request, reply) => {
      const limit = Number(request.query.limit) || 20;
      const page = Number(request.query.page || 1);
      const offset = (page - 1) * limit;

      const filter = request.query.search ? {
        should: [
            { key: "name", match: { text: request.query.search } } 
        ]
      } : undefined;

      const result = await qdrant.scroll('bands', {
        limit: limit,
        offset: offset as any, 
        filter: filter,
        with_vector: false,
        with_payload: true 
      });

      return result.points.map(p => ({
        id: p.id,
        ...(p.payload as any)
      }));
    });


server.get<{ Params: { id: string } }>('/bands/:id', async (request, reply) => {
      const { id } = request.params;
      const numericId = parseInt(id);

      if (isNaN(numericId)) {
        return reply.code(400).send({ error: "Invalid ID" });
      }
      
      const result = await qdrant.retrieve('bands', {
        ids: [numericId],
        with_vector: false
      });

      if (result.length === 0) {
        return reply.code(404).send({ error: "Band not found" });
      }

      return { id: result[0].id, ...result[0].payload };
    });

    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3001 using Qdrant');

  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

bootstrap();