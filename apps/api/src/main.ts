import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Band, UserInput } from './domain/types';
import { GeminiService } from './services/gemini.service';
import { RecommendationService } from './services/recommendation.service';

async function bootstrap() {
  const server = Fastify({ logger: true });

  try {
    const dataPath = path.resolve(__dirname, 'data', 'bands.json');
    const cachePath = path.resolve(__dirname, 'data', 'bands-with-vectors.json');
    
    let bands: Band[] = [];
    const aiService = new GeminiService();

    if (fs.existsSync(cachePath)) {
      console.log("Loading bands from CACHE");
      const rawData = fs.readFileSync(cachePath, 'utf-8');
      bands = JSON.parse(rawData);
    } else {
      console.log("CACHE not found. Loading raw data and generating vectors");
      if (!fs.existsSync(dataPath)) { throw new Error(`Data file not found at: ${dataPath}`); }
      
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      bands = JSON.parse(rawData);

      let changesMade = false;
      for (const band of bands) {
        if (!band.embedding) {
          process.stdout.write(`   - Vectorizing: ${band.name}... `);
          const context = `${band.name}. ${band.description}. Subgenres: ${band.subgenres.join(', ')}. Moods: ${band.moods.join(', ')}. Features: ${band.features.join(', ')}.`;
          band.embedding = await aiService.getEmbedding(context);
          console.log('Done.');
          changesMade = true;
        }
      }

      if (changesMade) {
        console.log("Saving bands with embeddings to CACHE for future runs...");
        fs.writeFileSync(cachePath, JSON.stringify(bands, null, 2));
      }
    }

    const recommender = new RecommendationService(aiService, bands);

    await server.register(cors, { origin: '*' });

    server.get('/', async () => {
      return { status: 'online', bandsLoaded: bands.length };
    });

    server.post<{ Body: UserInput }>('/recommend', async (request, reply) => {
      const userInput = request.body;
      const recommendations = await recommender.getRecommendations(userInput);
      return { recommendations };
    });

    await server.listen({ port: 3001 });
    console.log('Server running on http://localhost:3001');

  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

bootstrap();