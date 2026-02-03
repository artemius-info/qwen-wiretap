import { createServer, type Server } from 'http';
import { getCAPath } from './ca.js';
import chalk from 'chalk';

function generateSetupScript(proxyPort: number, setupPort: number): string {
  const caPath = getCAPath();

  return `#!/bin/bash
# CQ Wiretap - Terminal Setup Script
# This script configures your terminal session to route traffic through the proxy

# Proxy settings (for most HTTP clients)
export HTTP_PROXY="http://localhost:${proxyPort}"
export HTTPS_PROXY="http://localhost:${proxyPort}"
export http_proxy="http://localhost:${proxyPort}"
export https_proxy="http://localhost:${proxyPort}"

# Node.js CA certificate
export NODE_EXTRA_CA_CERTS="${caPath}"

# Python/OpenSSL CA certificates
export SSL_CERT_FILE="${caPath}"
export REQUESTS_CA_BUNDLE="${caPath}"

# curl CA certificate
export CURL_CA_BUNDLE="${caPath}"

# Ruby CA certificate
export SSL_CERT_DIR=""

# Git CA certificate (for HTTPS remotes)
export GIT_SSL_CAINFO="${caPath}"

# AWS CLI
export AWS_CA_BUNDLE="${caPath}"

# Disable proxy for localhost (prevents loops)
export NO_PROXY="localhost,127.0.0.1,::1"
export no_proxy="localhost,127.0.0.1,::1"

# Visual indicator that proxy is active
export WIRETAP_ACTIVE="1"

# Update PS1 to show proxy is active (optional - uncomment if desired)
# export PS1="[wiretap] $PS1"

echo ""
echo "  ✓ CQ Wiretap proxy configured for this terminal"
echo ""
echo "  Proxy:  http://localhost:${proxyPort}"
echo "  Setup:  http://localhost:${setupPort}/setup"
echo "  CA:     ${caPath}"
echo ""
echo "  All HTTP/HTTPS traffic from this terminal will be intercepted."
echo "  Run 'unset-wiretap' to disable."
echo ""

# Create unset function
unset-wiretap() {
  unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
  unset NODE_EXTRA_CA_CERTS SSL_CERT_FILE REQUESTS_CA_BUNDLE
  unset CURL_CA_BUNDLE SSL_CERT_DIR GIT_SSL_CAINFO AWS_CA_BUNDLE
  unset NO_PROXY no_proxy WIRETAP_ACTIVE
  echo "✓ Wiretap proxy disabled for this terminal"
}
export -f unset-wiretap 2>/dev/null || true
`;
}

function generateFishScript(proxyPort: number, setupPort: number): string {
  const caPath = getCAPath();

  return `# CQ Wiretap - Fish Shell Setup Script

set -gx HTTP_PROXY "http://localhost:${proxyPort}"
set -gx HTTPS_PROXY "http://localhost:${proxyPort}"
set -gx http_proxy "http://localhost:${proxyPort}"
set -gx https_proxy "http://localhost:${proxyPort}"
set -gx NODE_EXTRA_CA_CERTS "${caPath}"
set -gx SSL_CERT_FILE "${caPath}"
set -gx REQUESTS_CA_BUNDLE "${caPath}"
set -gx CURL_CA_BUNDLE "${caPath}"
set -gx GIT_SSL_CAINFO "${caPath}"
set -gx AWS_CA_BUNDLE "${caPath}"
set -gx NO_PROXY "localhost,127.0.0.1,::1"
set -gx no_proxy "localhost,127.0.0.1,::1"
set -gx WIRETAP_ACTIVE "1"

echo ""
echo "  ✓ CQ Wiretap proxy configured for this terminal"
echo ""
echo "  Proxy:  http://localhost:${proxyPort}"
echo "  Setup:  http://localhost:${setupPort}/setup"
echo "  CA:     ${caPath}"
echo ""

function unset-wiretap
  set -e HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
  set -e NODE_EXTRA_CA_CERTS SSL_CERT_FILE REQUESTS_CA_BUNDLE
  set -e CURL_CA_BUNDLE GIT_SSL_CAINFO AWS_CA_BUNDLE
  set -e NO_PROXY no_proxy WIRETAP_ACTIVE
  echo "✓ Wiretap proxy disabled"
end
`;
}

export function createSetupServer(proxyPort: number): Server {
  // Calculate setup port based on proxy port (setup port is proxy port + 2)
  const setupPort = proxyPort + 2;

  const server = createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${setupPort}`);

    // CORS headers for browser access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (url.pathname === '/' || url.pathname === '/setup') {
      // Detect shell from query param or User-Agent
      const shell = url.searchParams.get('shell') || 'bash';

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');

      if (shell === 'fish') {
        res.end(generateFishScript(proxyPort, setupPort));
      } else {
        res.end(generateSetupScript(proxyPort, setupPort));
      }
    } else if (url.pathname === '/status') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        active: true,
        proxyPort,
        setupPort,
        caPath: getCAPath(),
      }));
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  });

  server.listen(setupPort, () => {
    console.log(chalk.green('✓'), `Setup server started on port ${chalk.cyan(setupPort)}`);
  });

  return server;
}

export function getSetupCommand(proxyPort: number): string {
  const setupPort = proxyPort + 2;
  return `eval "$(curl -s http://localhost:${setupPort}/setup)"`;
}

export function getSetupPort(proxyPort: number): number {
  return proxyPort + 2;
}
