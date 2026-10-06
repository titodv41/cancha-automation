import WebSocket from 'ws';
import { endpoint, transportOptions } from './transport.mjs';

// No key, project ID, or RPC: test only the actual WebSocket route.
const socket = new WebSocket(endpoint, transportOptions());
const deadline = setTimeout(() => finish('NETWORK_TIMEOUT', false), 20000);
let finished = false;
function finish(result, ok) {
  if (finished) return;
  finished = true;
  clearTimeout(deadline);
  console.log(result);
  process.exitCode = ok ? 0 : 1;
  socket.on('error', () => {});
  socket.terminate();
}
socket.on('open', () => finish('WEBSOCKET_UPGRADE_OK; authenticated project access remains unverified', true));
socket.on('unexpected-response', (_request, response) => {
  const status = response.statusCode;
  response.resume();
  finish(`WEBSOCKET_HTTP_${status}; ${status === 401 ? 'authentication required; project access unverified' : 'route/upgrade not confirmed'}`, status === 401);
});
socket.on('error', () => finish('WEBSOCKET_TRANSPORT_ERROR; inspect network policy and proxy support', false));
