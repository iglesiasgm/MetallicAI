import path from "path";
import * as fs from 'fs';
import { Band, UserInput } from './domain/types';
import {GeminiService} from './services/gemini.service';
import { RecommendationService } from "./services/recommendation.service";
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

async function askUser(): Promise<UserInput> {
  const rl = readline.createInterface({input, output});

  const bandsAnswer = await rl.question('Enter your favorite bands (comma separated): ');
  const favoriteBands = bandsAnswer.split(',').map(b => b.trim()).filter(b => b.length > 0);

   const moodAnswer = await rl.question('Enter your target mood: ');

   rl.close();

   return {
    favoriteBands,
    targetMood: moodAnswer,
   };
}

async function bootstrap() {

  console.log('MetallicAI API started');

  try {

    //JSON file path
    const dataPath = path.resolve(__dirname, 'data', 'bands.json');
    if (!fs.existsSync(dataPath)) {throw new Error(`Data file not found at path: ${dataPath}`);}
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const bands: Band[] = JSON.parse(rawData);
    console.log(`Loaded ${bands.length} bands from data file.`);

    // Initialize Gemini Service
    const aiService = new GeminiService();

    for (const band of bands) {
      if (!band.embedding) {
        process.stdout.write(`Generating embedding for band: ${band.name}... `);
        const context = `${band.name}. ${band.description}. Subgenres: ${band.subgenres.join(', ')}. Moods: ${band.moods.join(', ')}. Features: ${band.features.join(', ')}.`;
        band.embedding = await aiService.getEmbedding(context);
        console.log('Done.');
      }
    }

    const recommender = new RecommendationService(aiService, bands);

    const userInput = await askUser();

    console.log('Fetching recommendations...');
    const recommendations = await recommender.getRecommendations(userInput);

    console.log('\nTop Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.band.name} (Score: ${rec.score.toFixed(4)})`);
      console.log(`Explanation: ${rec.explanation}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

bootstrap();