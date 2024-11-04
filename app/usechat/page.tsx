'use client';

import { useEffect, useState } from 'react';
import { Message, useChat } from 'ai/react';
import { ToolInvocation } from 'ai';

import LoadingIndicator from '@/components/loading-indicator';
import SubmitButton from '@/components/submit-button';
import WeatherCard from '@/components/weather-card';
import { WeatherParams, fetchWeatherData } from '@/base/weather';

import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

interface ExtendedMessage extends Message {
  htmlContent?: string;
}

export default function Chat() {
  const { messages, input, isLoading, handleInputChange, handleSubmit, stop, addToolResult } =
    useChat({
      maxToolRoundtrips: 5,
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'getCurrentWeather') {
          console.info('onToolCall(): ', toolCall);
          const params = toolCall.args as WeatherParams;
          console.info('onToolCall() params: ', params);
          const weatherData = await fetchWeatherData(params);

          return JSON.stringify(weatherData);
        }
      },
    });

  const [renderedMessages, setRenderedMessages] = useState<ExtendedMessage[]>([]);

  // role에 따라 사용자와 날씨 요정으로 변환
  const roleLabel = (role: string) => {
    if (role === 'user') return '사용자';
    if (role === 'assistant') return '날씨 요정';
    return role;
  };

  useEffect(() => {
    const processMessages = async () => {
      const updatedMessages = await Promise.all(
        messages.map(async (m) => {
          const processedContent = await remark()
            .use(remarkGfm)
            .use(html)
            .process(m.content);
          return { ...m, htmlContent: processedContent.toString() };
        })
      );
      setRenderedMessages(updatedMessages);
    };
    processMessages();
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-between w-full h-screen">
      <div className="w-full h-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col justify-between h-full">
          <div className="overflow-y-auto space-y-4">
            {renderedMessages.map((m) => (
              <div key={m.id}>
                <strong>{roleLabel(m.role)}:</strong>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: m.htmlContent || m.content }}
                />
                {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                  const toolCallId = toolInvocation.toolCallId;
                  const addResult = (result: string) =>
                    addToolResult({ toolCallId, result });

                  if (toolInvocation.toolName == 'getCurrentWeather') {
                    return 'result' in toolInvocation ? (
                      <div key={toolCallId} className="space-y-2">
                        <WeatherCard data={toolInvocation.result} />
                      </div>
                    ) : (
                      <div key={toolCallId} className="space-y-2">
                        Calling {toolInvocation.toolName}...
                      </div>
                    );
                  }

                  return 'result' in toolInvocation ? (
                    <div key={toolCallId} className="space-y-2">
                      Tool call {`${toolInvocation.toolName}: `} {toolInvocation.result}
                    </div>
                  ) : (
                    <div key={toolCallId} className="space-y-2">
                      Calling {toolInvocation.toolName}...
                    </div>
                  );
                })}
                <br />
              </div>
            ))}
          </div>
          {isLoading && <LoadingIndicator />}
          <form onSubmit={handleSubmit} className="flex w-full mt-4">
            <input
              value={input}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
              placeholder="오늘의 날씨는 어때?"
              disabled={isLoading}
            />
            <button
              className="px-4 text-sm text-white bg-green-700 rounded-r-lg flex items-center justify-center whitespace-nowrap"
              type="submit"
              disabled={!input.trim() || isLoading}
            >
              전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
