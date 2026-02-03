# Official Qwen API Specification (Based on Alibaba Cloud Documentation)

## API Endpoints

### OpenAI-Compatible Mode
- Base URL: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- Endpoint: `/chat/completions`

### Anthropic-Compatible Mode
- Base URL: `https://dashscope-intl.aliyuncs.com/apps/anthropic`
- Endpoint: `/v1/messages`

## Authentication

Authentication can be performed using either:
- HTTP Header: `x-api-key: YOUR_API_KEY`
- HTTP Header: `Authorization: Bearer YOUR_API_KEY`

Environment variables:
- `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`: Your Model Studio API key
- `ANTHROPIC_BASE_URL`: Set to `https://dashscope-intl.aliyuncs.com/apps/anthropic`

## Supported Models

The Anthropic API-compatible service supports the following Qwen models:

### Qwen-Max Series
- `qwen3-max`
- `qwen3-max-2026-01-23` (supports thinking mode)
- `qwen3-max-preview` (supports thinking mode)

### Qwen-Plus Series
- `qwen-plus`
- `qwen-plus-latest`
- `qwen-plus-2025-09-11`

### Qwen-Flash Series
- `qwen-flash`
- `qwen-flash-2025-07-28`

### Qwen-Turbo Series
- `qwen-turbo`
- `qwen-turbo-latest`

### Qwen-Coder Series
- `qwen3-coder-plus`
- `qwen3-coder-plus-2025-09-23`
- `qwen3-coder-flash`

### Qwen-VL Series
- `qwen-vl-max`
- `qwen-vl-plus`

## Request Fields

### Basic Fields
- `model` (string): The model name from the supported models list
- `max_tokens` (integer): Maximum number of tokens to generate
- `stream` (boolean): Enable streaming output
- `system` (string): System prompt
- `temperature` (float): Temperature coefficient (0.0-1.0)
- `top_p` (float): Nucleus sampling threshold (0.0-1.0)
- `top_k` (integer): Size of candidate set for sampling
- `stop_sequences` (array): Custom text sequences to stop generation

### Thinking Mode
- `thinking` (object): Enable deep thinking mode
  - `type` (string): `"enabled"`
  - `budget_tokens` (integer): Maximum tokens for thinking process

### Messages Format
- `messages` (array): Array of message objects
  - `role` (string): `"user"` or `"assistant"`
  - `content` (string or array): Message content
    - For text: `{type: "text", text: "message content"}`
    - For images: `{type: "image", source: {...}}`

### Tool Fields
- `tools` (array): Array of tool definitions
  - `name` (string): Tool name
  - `description` (string): Tool description
  - `input_schema` (object): JSON schema for tool inputs
- `tool_choice` (object): Specify tool usage
  - `type` (string): `"none"`, `"auto"`, `"any"`, or `"tool"`

## Response Format

The API returns responses in the Anthropic Messages format:

```json
{
  "id": "string",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "response content"
    }
  ],
  "model": "string",
  "stop_reason": "end_turn|max_tokens|stop_sequence|tool_use",
  "stop_sequence": "string|null",
  "usage": {
    "input_tokens": 0,
    "output_tokens": 0
  }
}
```

## Streaming Responses

For streaming responses (when `stream=true`), the API sends Server-Sent Events (SSE) with the following event types:
- `message_start`
- `content_block_start`
- `content_block_delta`
- `content_block_stop`
- `message_delta`
- `message_stop`

## Error Codes

- `400`: `invalid_request_error` - Invalid request format
- `403`: `authentication_error` - Invalid API key
- `404`: `not_found_error` - Resource not found
- `429`: `rate_limit_error` - Rate limit exceeded
- `500`: `api_error` - Internal server error
- `529`: `overloaded_error` - Server overloaded

## Compatibility Notes

- The Anthropic API compatibility layer supports most Anthropic API features
- Some features like image/video content types may have limited support
- Tool usage and system prompts are fully supported
- Streaming responses follow Anthropic SSE format
- Token counting follows Anthropic conventions