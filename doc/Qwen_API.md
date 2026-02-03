# Qwen API Documentation Reference

## API Endpoints Used

During the implementation of the CQ Wiretap proxy for Qwen API, the following endpoints were referenced based on the official Alibaba Cloud documentation:

- **OpenAI-Compatible Endpoint**: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`
- **Anthropic-Compatible Endpoint**: `https://dashscope-intl.aliyuncs.com/apps/anthropic/v1/messages` 
- **Anthropic-Compatible Endpoint** alternative: `https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy` source `https://github.com/charmbracelet/crush/issues/449`

## API Compatibility

The Qwen API supports both:
- OpenAI-compatible mode (using the `/compatible-mode/v1/chat/completions` endpoint)
- Anthropic-compatible mode (using the `/apps/anthropic/v1/messages` endpoint)

## Key Features Implemented

- Support for `qwen3-max-2026-01-23` model and other Qwen models
- Streaming responses handling
- Token usage tracking
- Request/response interception
- Real-time visualization in the dashboard

## Source Reference

This implementation was based on information from the official Alibaba Cloud documentation available at:
[Anthropic API compatibility - Alibaba Cloud Model Studio](d:\Code\qwen-wiretap\Anthropic API compatibility - Alibaba Cloud Model Studio.md)

The official guide provided details about:
- API key configuration using `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`
- Base URL setup using `https://dashscope-intl.aliyuncs.com/apps/anthropic`
- Model specification including `qwen3-max`, `qwen-plus`, and other Qwen models
- Advanced features like thinking mode with `{"type": "enabled", "budget_tokens": 1024}`
- Proper endpoint format: `/apps/anthropic/v1/messages`