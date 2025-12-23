import 'dotenv/config';

export const envs = {
    openAiApiKey: process.env.OPENAI_API_KEY || '',
};

if (!envs.openAiApiKey) {
    throw new Error('Missing OPENAI_API_KEY in environment variables');
}