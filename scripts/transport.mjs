import WebSocket from 'ws';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const endpoint = 'wss://api.framer.com/channel/headless-plugin';
export function transportOptions() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  return { ...(proxy ? { agent: new HttpsProxyAgent(proxy) } : {}), handshakeTimeout: 15000 };
}

// framer-api captures globalThis.WebSocket at import time. ws supports the
// Authorization header used by the SDK and an explicit HTTPS CONNECT proxy.
export function installTransport() {
  globalThis.WebSocket = class extends WebSocket {
    constructor(url, options) {
      if (new URL(url).origin !== 'wss://api.framer.com') {
        throw new Error('Unexpected Framer endpoint');
      }
      super(url, { ...options, ...transportOptions() });
    }
  };
}
