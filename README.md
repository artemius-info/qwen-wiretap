# CQ Wiretap

HTTP/HTTPS proxy for intercepting and visualizing Claude and Qwen API traffic in real-time.

![CQ Wiretap Dashboard](assets/screen-2026-01-23-21.08.29.png)

## Overview

CQ Wiretap acts as a man-in-the-middle proxy that intercepts all traffic between Claude Code CLI, Qwen API, and their respective services. It captures requests and responses in real-time and displays them in a web dashboard.

**Use cases:**
- Debug Claude Code conversations and tool calls
- Debug Qwen API requests and responses
- Analyze token usage and API costs
- Inspect system prompts and tool definitions
- Monitor streaming responses as they happen
- Examine Qwen-specific features like thinking mode
- Understand how Claude Code and Qwen APIs work under the hood

## Quick Start

### For Claude API:
```bash
# Run the Claude proxy
npx cq-wiretap --type claude --port 8080 --ws-port 8081 --ui-port 3000

# In another terminal, configure it for proxying
eval "$(curl -s http://localhost:8082/setup)"  # Setup port = proxy port + 2

# Now run Claude Code - all Claude API traffic will be captured
claude
```

### For Qwen API:
```bash
# Run the Qwen proxy
npx cq-wiretap --type qwen --port 9090 --ws-port 9091 --ui-port 4000

# In another terminal, configure it for proxying
eval "$(curl -s http://localhost:9092/setup)"  # Setup port = proxy port + 2

# Now make Qwen API calls - all Qwen API traffic will be captured
# OpenAI-compatible endpoint:
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions ...

# Anthropic-compatible endpoint:
curl -X POST https://dashscope-intl.aliyuncs.com/apps/anthropic/v1/messages ...
```

### For Both APIs (Legacy Mode):
```bash
# Run the proxy for both Claude and Qwen
npx cq-wiretap --type both --port 8080 --ws-port 8081 --ui-port 3000

# In another terminal, configure it for proxying
eval "$(curl -s http://localhost:8082/setup)"  # Setup port = proxy port + 2

# Now run Claude Code or Qwen API calls - all API traffic will be captured
claude
# or
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions ...
```

Open http://localhost:3000 to view the dashboard.

## Installation

### npx (no install)

```bash
npx cq-wiretap
```

### Global install

```bash
npm install -g cq-wiretap
cq-wiretap
```

### From source

```bash
git clone https://github.com/wierdbytes/cq-wiretap.git
cd cq-wiretap
pnpm install
pnpm dev
```

## Usage

### 1. Start the proxy

```bash
cq-wiretap
```

Options:
- `-p, --port <port>` - Proxy server port (default: 8080)
- `-w, --ws-port <port>` - WebSocket server port (default: 8081)
- `-u, --ui-port <port>` - UI dashboard port (default: 3000)
- `-t, --type <type>` - API type to intercept (claude, qwen, both) (default: both)
- `-q, --quiet` - Suppress banner output

### 2. Configure your terminal

**Recommended: One-liner setup**

```bash
eval "$(curl -s http://localhost:8082/setup)"
```

This configures all necessary environment variables for the current shell session.

To disable:
```bash
unset-wiretap
```

**Fish shell:**
```bash
eval (curl -s http://localhost:8082/setup?shell=fish)
```

**Manual setup:**
```bash
NODE_EXTRA_CA_CERTS="$HOME/.cq-wiretap/ca.pem" \
HTTPS_PROXY=http://localhost:8080 \
claude
```

### 3. Open the dashboard

Navigate to http://localhost:3000 in your browser.

## Dashboard Features

### Header
Displays connection status, current request info, token usage with cache breakdown, and rate limit indicators.

### Requests Panel (Sidebar)
Lists all intercepted API requests in chronological order. Shows total input tokens sent. Toggle with `S` key.

### Request Detail View
When a request is selected, displays a collapsible report with:

| Section | Description |
|---------|-------------|
| **System Prompt** | System instructions sent to the API (collapsible) |
| **Available Tools** | Tool definitions with names, descriptions, and input schemas |
| **Messages** | User and assistant messages with content preview when collapsed |
| **Thinking Blocks** | Extended thinking content (when present) |
| **Tool Calls** | Tool invocations with input parameters |
| **Tool Results** | Results returned from tool executions |
| **Response** | Assistant response with stop reason indicator |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `S` | Toggle sidebar |
| `F` | Fold all content blocks |
| `E` | Expand all content blocks |
| `Space` | Select last request |
| `1` | Toggle system prompt visibility |
| `2` | Toggle tools visibility |
| `3` | Toggle messages visibility |
| `X` | Clear all requests |
| `?` | Show hotkeys help |

## Ports

| Port | Service |
|------|---------|
| 8080 | HTTP/HTTPS proxy |
| 8081 | WebSocket (proxy to UI communication) |
| 8082 | Setup server (terminal configuration endpoint) |
| 3000 | Web dashboard |

## Port Configuration:
- Proxy port (`--port`): Main proxy server port
- WebSocket port (`--ws-port`): For real-time communication with UI
- UI port (`--ui-port`): Web dashboard port
- Setup port: Dynamically calculated as proxy port + 2 (used for terminal setup script)

## CA Certificate

On first run, a CA certificate is generated at `~/.cq-wiretap/`:
- `ca.pem` - Certificate
- `ca-key.pem` - Private key

The setup script automatically configures `NODE_EXTRA_CA_CERTS` and other environment variables to trust this certificate.

**Optional: Trust system-wide**

macOS:
```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain ~/.cq-wiretap/ca.pem
```

Linux (Debian/Ubuntu):
```bash
sudo cp ~/.cq-wiretap/ca.pem /usr/local/share/ca-certificates/cq-wiretap.crt
sudo update-ca-certificates
```

## Environment Variables

The setup script configures these variables:

| Variable | Purpose |
|----------|---------|
| `HTTP_PROXY`, `HTTPS_PROXY` | Proxy address |
| `NODE_EXTRA_CA_CERTS` | Node.js CA certificate |
| `SSL_CERT_FILE`, `REQUESTS_CA_BUNDLE` | Python/OpenSSL |
| `CURL_CA_BUNDLE` | curl |
| `GIT_SSL_CAINFO` | Git HTTPS |
| `AWS_CA_BUNDLE` | AWS CLI |
| `NO_PROXY` | Localhost exclusions |

## How It Works

1. **Proxy** intercepts HTTPS traffic to `api.anthropic.com`, `api.claude.ai`, `dashscope-intl.aliyuncs.com`, and `dashscope.aliyuncs.com` (including endpoints `/v1/messages`, `/compatible-mode/v1/chat/completions`, and `/apps/anthropic/v1/messages`)
2. **Interceptor** parses Claude and Qwen API request/response format
3. **SSE Parser** handles streaming responses in real-time
4. **WebSocket** broadcasts events to connected dashboard clients
5. **Dashboard** renders the intercepted data with filtering and formatting

The proxy captures traffic without modifying it - your Claude Code and Qwen API sessions work exactly as they would without the proxy.

## Development

To run in development mode:

```bash
pnpm dev
```

This will start the proxy in watch mode, automatically reloading when changes are detected.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT