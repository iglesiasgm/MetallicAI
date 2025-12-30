import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { envs } from './config/envs';

async function listMyModels() {
  try {
    const genAI = new GoogleGenerativeAI(envs.geminiApiKey);
    
    const response = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).apiKey; 
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${envs.geminiApiKey}`;
    const fetchRes = await fetch(url);
    const data = await fetchRes.json();

    if (data.error) {
      console.error("API Error:", data.error.message);
      return;
    }

    console.log("\n Available Generative Models:");

    const chatModels = data.models?.filter((m: any) => 
      m.supportedGenerationMethods.includes("generateContent")
    );

    if (chatModels) {
      chatModels.forEach((m: any) => {
        const cleanName = m.name.replace('models/', '');
        console.log(`- ${cleanName}`);
      });
    } else {
      console.log("No chat models found.");
    }

  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

listMyModels();