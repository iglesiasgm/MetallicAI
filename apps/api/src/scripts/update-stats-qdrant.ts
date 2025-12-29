import { QdrantClient } from '@qdrant/js-client-rest';
import { SpotifyService } from '../services/spotify.service';
import dotenv from 'dotenv';

dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://127.0.0.1:6333';
const COLLECTION_NAME = 'bands';


async function updatePopularityDirectly() {
  
  const qdrant = new QdrantClient({ url: QDRANT_URL });
  const spotify = new SpotifyService();

  try {
    const response = await qdrant.scroll(COLLECTION_NAME, {
      limit: 1000,
      with_payload: true,
      with_vector: false
    });

    const points = response.points;

    let updatedCount = 0;

    for (const point of points) {
      const payload = point.payload || {};
      const bandName = payload.name as string;
      
      const links = payload.links as any; 
      const spotifyLink = links?.spotify;

      if (spotifyLink) {
        const details = await spotify.getBandDetails(spotifyLink);

        if (details) {
          await qdrant.setPayload(COLLECTION_NAME, {
            points: [point.id],
            payload: {
              popularity: details.popularity,
              imageUrl: details.imageUrl
            }
          });

          console.log(`Band updated: ${bandName} | Popularity: ${details.popularity}`);
          updatedCount++;
        }
      }

      await new Promise(r => setTimeout(r, 50));
    }


  } catch (error) {
    console.error("Error updating Qdrant:", error);
  }
}

updatePopularityDirectly();