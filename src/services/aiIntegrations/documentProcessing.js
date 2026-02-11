import { callLambdaFunction } from '../aiClient';

const CHAT_COMPLETION_ENDPOINT = import.meta.env?.VITE_AWS_LAMBDA_CHAT_COMPLETION_URL;

/**
 * Process PDF/document using OpenAI Vision and chat completion
 * 
 * @param {string} documentBase64 - Base64 encoded document (PDF or image)
 * @param {string} task - Processing task ('extract', 'analyze', 'summarize', 'qa')
 * @param {string} query - Optional query for Q&A tasks
 * @param {object} options - Additional parameters
 * @returns {Promise<object>} Response with processed document data
 */
export async function processDocument(documentBase64, task = 'analyze', query = '', options = {}) {
  const isPDF = documentBase64?.includes('application/pdf') || options?.fileType === 'pdf';
  
  // Ensure proper data URI format
  let documentDataUri;
  if (isPDF) {
    documentDataUri = documentBase64?.startsWith('data:application/pdf') 
      ? documentBase64 
      : `data:application/pdf;base64,${documentBase64}`;
  } else {
    documentDataUri = documentBase64?.startsWith('data:') 
      ? documentBase64 
      : `data:image/jpeg;base64,${documentBase64}`;
  }

  const taskPrompts = {
    extract: 'Extract all text and structured data from this document. Organize the information clearly.',
    analyze: 'Analyze this document and provide insights about its content, structure, and key information.',
    summarize: 'Provide a comprehensive summary of this document, highlighting the main points and important details.',
    qa: query || 'Answer questions about this document.'
  };

  const content = [
    { 
      type: 'text', 
      text: taskPrompts?.[task] || taskPrompts?.analyze
    }
  ];

  // Add document based on type
  if (isPDF) {
    content?.push({
      type: 'file',
      file: {
        file_data: documentDataUri,
        filename: options?.filename || 'document.pdf'
      }
    });
  } else {
    content?.push({
      type: 'image_url',
      image_url: {
        url: documentDataUri,
        detail: 'high'
      }
    });
  }

  const payload = {
    provider: 'OPEN_AI',
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content
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
