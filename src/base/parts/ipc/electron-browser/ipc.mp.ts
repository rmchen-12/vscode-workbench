import { ipcRenderer } from 'electron';
import { Event } from 'base/common/event';
import { ClientConnectionEvent, IPCServer } from 'base/parts/ipc/common/ipc';
import { Protocol as MessagePortProtocol } from 'base/parts/ipc/common/ipc.mp';
import { generateUuid } from 'src/base/common/uuid';

/**
 * An implementation of a `IPCServer` on top of MessagePort style IPC communication.
 * The clients register themselves via Electron IPC transfer.
 */
export class Server extends IPCServer {
  private static getOnDidClientConnect(): Event<ClientConnectionEvent> {
    // Clients connect via `hi:createMessageChannel` to get a
    // `MessagePort` that is ready to be used. For every connection
    // we create a pair of message ports and send it back.
    //
    // The `nonce` is included so that the main side has a cha v 5432`nce to
    // correlate the response back to the sender.
    // const onCreateMessageChannel = Event.fromNodeEventEmitter<string>(ipcRenderer, "hi:createMessageChannel", (_, nonce: string) => nonce);

    return Event.fromDOMEventEmitter(window, 'load', () => {
      // Create a new pair of ports and protocol for this connection
      const { port1: incomingPort, port2: outgoingPort } = new MessageChannel();
      const protocol = new MessagePortProtocol(incomingPort);

      const result: ClientConnectionEvent = {
        protocol,
        // Not part of the standard spec, but in Electron we get a `close` event
        // when the other side closes. We can use this to detect disconnects
        // (https://github.com/electron/electron/blob/11-x-y/docs/api/message-port-main.md#event-close)
        onDidClientDisconnect: Event.fromDOMEventEmitter(incomingPort, 'close'),
      };

      // Send one port back to the requestor
      // Note: we intentionally use `electron` APIs here because
      // transferables like the `MessagePort` cannot be transferred
      // over preload scripts when `contextIsolation: true`
      const nonce = generateUuid();

      window.parent.postMessage(nonce, '*', [outgoingPort]);
      // ipcRenderer.postMessage('hi:createMessageChannelResult', nonce, [outgoingPort]);

      return result;
    });
  }

  constructor() {
    super(Server.getOnDidClientConnect());
  }
}
