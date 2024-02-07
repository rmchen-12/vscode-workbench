import { Event } from 'base/common/event';
import { generateUuid } from 'base/common/uuid';

interface IMessageChannelResult {
  nonce: string;
  port: MessagePort;
}

export interface IpcMessagePort {
  /**
   * Acquire a `MessagePort`. The main process will transfer the port over to
   * the `responseChannel` with a payload of `requestNonce` so that the source can
   * correlate the response.
   *
   * The source should install a `window.on('message')` listener, ensuring `e.data`
   * matches `nonce`, `e.source` matches `window` and then receiving the `MessagePort`
   * via `e.ports[0]`.
   */
  acquire(responseChannel: string, nonce: string): void;
}

export async function acquirePort(type: 'sharedProcess' | 'mainProcess' | 'mainApp', nonce = generateUuid()): Promise<MessagePort> {
  // we are in charge to trigger acquisition of the message port from main
  window.parent.postMessage({ nonce, type }, '*');

  // Wait until the main side has returned the `MessagePort`
  // We need to filter by the `nonce` to ensure we listen
  // to the right response.
  const onMessageChannelResult = Event.fromDOMEventEmitter<IMessageChannelResult>(window, 'message', (e: MessageEvent) => ({ nonce: e.data, port: e.ports[0] }));
  const { port } = await Event.toPromise(Event.once(Event.filter(onMessageChannelResult, (e) => e.nonce === nonce)));

  return port;
}
