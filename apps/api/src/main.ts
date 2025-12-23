import path from "path";
import * as fs from 'fs';
import { Band } from './domain/types';

async function bootstrap() {

  console.log('MetallicAI API started');

  try {
    const dataPath = path.resolve(__dirname, 'data', 'bands.json');

    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data file not found at path: ${dataPath}`);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const bands: Band[] = JSON.parse(rawData);

    console.log(`Loaded ${bands.length} bands from data file.`);
  } catch (error) {
    console.error('Error loading bands data:', error);
  }
}

bootstrap();