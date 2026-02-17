import { callLambdaFunction } from '../aiClient';

const CHAT_COMPLETION_ENDPOINT = import.meta.env?.VITE_AWS_LAMBDA_CHAT_COMPLETION_URL;

/**
 * Translate text using OpenAI
 * 
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language (e.g., 'Spanish', 'French', 'Arabic')
 * @param {string} sourceLanguage - Source language (optional, auto-detect if not provided)
 * @param {object} options - Additional parameters
 * @returns {Promise<object>} Response with translated text
 */
export async function translateText(text, targetLanguage, sourceLanguage = 'auto-detect', options = {}) {
  const systemPrompt = sourceLanguage === 'auto-detect'
    ? `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original tone, style, and formatting. Return only the translated text without any additional commentary.`
    : `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Maintain the original tone, style, and formatting. Return only the translated text without any additional commentary.`;

  const payload = {
    provider: 'OPEN_AI',
    model: 'gpt-5',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: text
      }
    ],
    stream: false,
    parameters: {
      max_completion_tokens: options?.max_tokens || 4096,
      temperature: 0.3
    }
  };

  const response = await callLambdaFunction(CHAT_COMPLETION_ENDPOINT, payload);
  return response;
}
