// application logic

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { conversationRepository } from '../repositories/conversation.repository.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Implementation detail
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function buildInstructions() {
  const template = await fs.readFile(path.resolve(__dirname, '../prompts/chatbot.txt'), 'utf8');
  const dbSchema = await fs.readFile(path.resolve(__dirname, '../prompts/db-explorer-context.md'), 'utf8');
  return template.replace('{{dbSchema}}', dbSchema);
}

// Public interface
export const chatService = {
  // Chat service methods would go here
  async sendMessage(prompt, conversationId) {
    const instructions = await buildInstructions();
    const recentMessages = conversationRepository.getRecentMessages(conversationId, 10);
    const messages = [
      { role: 'system', content: instructions },
      ...recentMessages,
      { role: 'user', content: prompt },
    ];

    // Implementation for sending a message
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
      max_tokens: 200, //max_completion_tokens
      //stream: true,
    });

    const assistantMessage = response.choices?.[0]?.message?.content ?? '';
    conversationRepository.appendMessage(conversationId, 'user', prompt);
    conversationRepository.appendMessage(conversationId, 'assistant', assistantMessage);

    return {
      id: response.id,
      message: assistantMessage,
    };
  },
};
