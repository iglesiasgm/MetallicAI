import 'dotenv/config';

export const envs = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
};

if (!envs.geminiApiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment variables');
}