import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';

import { weatherSchema } from '@/base/weather';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    messages: convertToCoreMessages(messages),
    tools: {
      getCurrentWeather: {
        description: 'Get the current weather information for a specific city or region. The user can provide the name of the city and nation, and optionally specify the temperature unit (Celsius or Fahrenheit) and the language for the response.',
        parameters: weatherSchema,
      },
    },
  });

  return result.toAIStreamResponse();
}
