import type { CompletedRequest } from 'mockttp';
import { randomUUID } from 'crypto';
import chalk from 'chalk';
import type {
  ClaudeResponse,
  InterceptedRequest,
  APIRequest,
  OpenAIResponse,
} from './types.js';
import { SSEStreamParser, reconstructResponseFromEvents } from './parser.js';
import type { WiretapWebSocketServer } from './websocket.js';

export const API_HOSTS = [
  'api.anthropic.com',
  'api.claude.ai',
  'dashscope-intl.aliyuncs.com',
  'dashscope.aliyuncs.com',
];

const CLAUDE_MESSAGES_PATH = '/v1/messages';
const QWEN_CHAT_COMPLETIONS_PATH = '/v1/chat/completions';
const QWEN_ANTHROPIC_COMPATIBLE_PATH = '/apps/anthropic';
const QWEN_ANTHROPIC_MESSAGES_PATH = '/apps/anthropic/v1/messages';

export class ClaudeInterceptor {
  private wsServer: WiretapWebSocketServer;
  private activeRequests: Map<string, {
    request: InterceptedRequest;
    parser: SSEStreamParser;
  }> = new Map();

  constructor(wsServer: WiretapWebSocketServer) {
    this.wsServer = wsServer;
  }

  isClaudeRequest(request: CompletedRequest): boolean {
    const host = request.headers.host || new URL(request.url).host;
    const path = new URL(request.url).pathname;

    const isClaudeHost = API_HOSTS.slice(0, 2).some((h) => host.includes(h)); // anthropic.com, claude.ai
    const isQwenHost = API_HOSTS.slice(2).some((h) => host.includes(h)); // dashscope domains

    const isClaudePath = path.includes(CLAUDE_MESSAGES_PATH);
    const isQwenChatPath = path.includes(QWEN_CHAT_COMPLETIONS_PATH);
    const isQwenAnthropicPath = path.includes(QWEN_ANTHROPIC_COMPATIBLE_PATH) && path.includes('/v1/messages');

    return (
      (isClaudeHost && isClaudePath && request.method === 'POST') ||
      (isQwenHost && (isQwenChatPath || isQwenAnthropicPath) && request.method === 'POST')
    );
  }

  async handleRequest(request: CompletedRequest): Promise<string | null> {
    if (!this.isClaudeRequest(request)) {
      return null;
    }

    const requestId = randomUUID();
    const timestamp = Date.now();

    // Parse request body
    let requestBody: APIRequest | undefined;
    try {
      const bodyBuffer = request.body.buffer;
      if (bodyBuffer.length > 0) {
        const bodyText = bodyBuffer.toString('utf-8');
        requestBody = JSON.parse(bodyText) as APIRequest;
      }
    } catch (error) {
      console.error(chalk.yellow('⚠'), 'Failed to parse request body:', error);
    }

    // Create intercepted request
    const intercepted: InterceptedRequest = {
      id: requestId,
      timestamp,
      method: request.method,
      url: request.url,
      requestHeaders: this.headersToRecord(request.headers),
      requestBody,
      sseEvents: [],
    };

    // Store active request
    this.activeRequests.set(requestId, {
      request: intercepted,
      parser: new SSEStreamParser(),
    });

    // Add to store and broadcast
    this.wsServer.addRequest(intercepted);

    this.wsServer.broadcast({
      type: 'request_start',
      requestId,
      timestamp,
      method: request.method,
      url: request.url,
      headers: intercepted.requestHeaders,
    });

    if (requestBody) {
      this.wsServer.broadcast({
        type: 'request_body',
        requestId,
        body: requestBody,
      });

      // Log request info
      const model = requestBody.model || 'unknown';

      // Determine if this is a Claude or OpenAI request to get message count
      let messageCount = 0;
      let hasTools = false;
      let isStreaming = requestBody.stream === true;

      if ('messages' in requestBody) {
        messageCount = requestBody.messages?.length || 0;

        // Check for tools based on request type
        if ('tools' in requestBody && requestBody.tools) {
          hasTools = Array.isArray(requestBody.tools) && requestBody.tools.length > 0;
        }
      }

      console.log(
        chalk.cyan('→'),
        chalk.white(`[${requestId.slice(0, 8)}]`),
        chalk.green(model),
        `${messageCount} messages`,
        hasTools ? chalk.yellow(`+ ${Array.isArray(requestBody.tools) ? requestBody.tools.length : 0} tools`) : '',
        isStreaming ? chalk.magenta('streaming') : ''
      );
    }

    return requestId;
  }

  async handleResponseStart(
    requestId: string,
    statusCode: number,
    headers: Record<string, string>
  ): Promise<void> {
    const active = this.activeRequests.get(requestId);
    if (!active) {
      return;
    }

    const timestamp = Date.now();
    active.request.responseStartTime = timestamp;
    active.request.statusCode = statusCode;
    active.request.responseHeaders = headers;

    this.wsServer.broadcast({
      type: 'response_start',
      requestId,
      timestamp,
      statusCode,
      headers,
    });
  }

  handleResponseChunk(requestId: string, chunk: Buffer | string): void {
    const active = this.activeRequests.get(requestId);
    if (!active) {
      return;
    }

    const data = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
    const events = active.parser.feed(data);

    for (const event of events) {
      active.request.sseEvents.push(event);
      this.wsServer.broadcast({
        type: 'response_chunk',
        requestId,
        event,
      });

      // Log streaming progress for text deltas
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        process.stdout.write(chalk.gray('.'));
      }
    }
  }

  async handleResponseComplete(requestId: string): Promise<void> {
    const active = this.activeRequests.get(requestId);
    if (!active) {
      return;
    }

    // Flush any remaining data
    const remainingEvents = active.parser.flush();
    for (const event of remainingEvents) {
      active.request.sseEvents.push(event);
      this.wsServer.broadcast({
        type: 'response_chunk',
        requestId,
        event,
      });
    }

    // Reconstruct full response
    const response = reconstructResponseFromEvents(active.request.sseEvents);
    const timestamp = Date.now();
    const durationMs = timestamp - active.request.timestamp;

    active.request.response = response || undefined;
    active.request.durationMs = durationMs;

    if (response) {
      this.wsServer.broadcast({
        type: 'response_complete',
        requestId,
        timestamp,
        response,
        durationMs,
      });

      // Log completion - handle both Claude and OpenAI responses
      console.log(); // New line after streaming dots

      if ('type' in response && response.type === 'message') {
        // Claude response
        console.log(
          chalk.green('✓'),
          chalk.white(`[${requestId.slice(0, 8)}]`),
          `${response.usage.input_tokens} in / ${response.usage.output_tokens} out`,
          chalk.gray(`(${durationMs}ms)`),
          response.stop_reason === 'tool_use' ? chalk.yellow('→ tool_use') : ''
        );
      } else if ('object' in response && response.object === 'chat.completion') {
        // OpenAI response
        const usage = (response as OpenAIResponse).usage;
        console.log(
          chalk.green('✓'),
          chalk.white(`[${requestId.slice(0, 8)}]`),
          `${usage.prompt_tokens} in / ${usage.completion_tokens} out`,
          chalk.gray(`(${durationMs}ms)`)
        );
      } else {
        // Generic response
        console.log(
          chalk.green('✓'),
          chalk.white(`[${requestId.slice(0, 8)}]`),
          chalk.gray(`(${durationMs}ms)`)
        );
      }
    }

    // Cleanup
    this.activeRequests.delete(requestId);
  }

  handleResponseError(requestId: string, error: Error): void {
    const active = this.activeRequests.get(requestId);
    if (!active) {
      return;
    }

    active.request.error = error.message;

    this.wsServer.broadcast({
      type: 'error',
      requestId,
      error: error.message,
      timestamp: Date.now(),
    });

    console.log(
      chalk.red('✗'),
      chalk.white(`[${requestId.slice(0, 8)}]`),
      error.message
    );

    this.activeRequests.delete(requestId);
  }

  handleNonStreamingResponse(
    requestId: string,
    _statusCode: number,
    bodyText: string
  ): void {
    const active = this.activeRequests.get(requestId);
    if (!active) {
      return;
    }

    try {
      if (bodyText) {
        // Try to parse as Claude response first, then OpenAI response
        let parsedResponse: ClaudeResponse | OpenAIResponse;
        try {
          parsedResponse = JSON.parse(bodyText) as ClaudeResponse;
        } catch {
          try {
            parsedResponse = JSON.parse(bodyText) as OpenAIResponse;
          } catch {
            console.error(chalk.yellow('⚠'), 'Failed to parse response as Claude or OpenAI format:', bodyText.substring(0, 200) + '...');
            return;
          }
        }

        const timestamp = Date.now();
        const durationMs = timestamp - active.request.timestamp;

        active.request.response = parsedResponse;
        active.request.durationMs = durationMs;

        this.wsServer.broadcast({
          type: 'response_complete',
          requestId,
          timestamp,
          response: parsedResponse,
          durationMs,
        });

        // Handle logging differently based on response type
        if ('type' in parsedResponse && parsedResponse.type === 'message') {
          // Claude response
          console.log(
            chalk.green('✓'),
            chalk.white(`[${requestId.slice(0, 8)}]`),
            `${parsedResponse.usage.input_tokens} in / ${parsedResponse.usage.output_tokens} out`,
            chalk.gray(`(${durationMs}ms)`),
            parsedResponse.stop_reason === 'tool_use' ? chalk.yellow('→ tool_use') : ''
          );
        } else if ('type' in parsedResponse && parsedResponse.type === 'error') {
          // Claude error response
          console.log(
            chalk.yellow('⚠'),
            chalk.white(`[${requestId.slice(0, 8)}]`),
            chalk.red(parsedResponse.error.message),
            chalk.gray(`(${durationMs}ms)`)
          );
        } else if ('object' in parsedResponse && parsedResponse.object === 'chat.completion') {
          // OpenAI response
          const usage = (parsedResponse as OpenAIResponse).usage;
          console.log(
            chalk.green('✓'),
            chalk.white(`[${requestId.slice(0, 8)}]`),
            `${usage.prompt_tokens} in / ${usage.completion_tokens} out`,
            chalk.gray(`(${durationMs}ms)`)
          );
        } else {
          // Generic response
          console.log(
            chalk.green('✓'),
            chalk.white(`[${requestId.slice(0, 8)}]`),
            chalk.gray(`(${durationMs}ms)`)
          );
        }
      }
    } catch (error) {
      console.error(chalk.yellow('⚠'), 'Failed to parse response body:', error);
    }

    this.activeRequests.delete(requestId);
  }

  private headersToRecord(headers: Record<string, string | string[] | undefined>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined) {
        result[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    }
    return result;
  }

  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }
}
