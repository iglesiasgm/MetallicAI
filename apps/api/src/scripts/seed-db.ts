import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GeminiService } from '../services/gemini.service';
import { Band } from '../domain/types';

const COLLECTION_NAME = 'bands';

async function seed() {
  console.log("Migrating bands to Qdrant vector DB");
  
  const aiService = new GeminiService();
  const client = new QdrantClient({ url: 'http://localhost:6333' });

  const dataPath = path.join(__dirname, '../data/bands.json');
  if (!fs.existsSync(dataPath)) {
    console.error("Bands data file not found:", dataPath);
    return;
  }
  const bands: Band[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const result = await client.getCollections();
  const exists = result.collections.some(c => c.name === COLLECTION_NAME);
  
  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: { size: 768, distance: 'Cosine' }
    });
    console.log(`Collection '${COLLECTION_NAME}' created.`);
  }

  console.log(`Preparing to upload ${bands.length} bands`);
  
  const points = [];

  for (const band of bands) {
    let vector = band.embedding;
    
    if (!vector) {
      process.stdout.write(`Vectorizing: ${band.name}`);
      const context = `${band.name}. ${band.description}. Genres: ${band.subgenres.join(', ')}. Moods: ${band.moods.join(', ')}`;
      await new Promise(r => setTimeout(r, 500)); 
      vector = await aiService.getEmbedding(context);
    }

    const { embedding, ...payload } = band;

    points.push({
      id: parseInt(band.id) || Math.floor(Math.random() * 1000000), 
      vector: vector,
      payload: payload as any 
    });
  }

  if (points.length > 0) {
    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: points
    });
    console.log(`Uploaded ${points.length} bands to Qdrant collection '${COLLECTION_NAME}'.`);
  }
}

seed().catch(console.error);