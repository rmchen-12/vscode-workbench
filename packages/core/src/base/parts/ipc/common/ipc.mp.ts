import { VSBuffer } from 'base/common/buffer';
import { Event } from 'base/common/event';
import { IDisposable } from 'base/common/lifecycle';
import { IMessagePassingProtocol, IPCClient } from 'base/parts/ipc/common/ipc';

/**
 * Declare minimal `MessageEvent` and `MessagePort` interfaces here
 * so that this utility can be used both from `browser` and
 * `electron-main` namespace where message ports are available.
 */

export interface MessageEvent {
  /**
   * For our use we only consider `Uint8Array` a valid data transfer
   * via message ports because our protocol implementation is buffer based.
   */
  data: Uint8Array;
}

export interface MessagePort {
  addEventListener(type: 'message', listener: (this: MessagePort, e: MessageEvent) => unknown): void;
  removeEventListener(type: 'message', listener: (this: MessagePort, e: MessageEvent) => unknown): void;

  postMessage(message: Uint8Array): void;

  start(): void;
  close(): void;
}

/**
 * The MessagePort `Protocol` leverages MessagePort style IPC communication
 * for the implementation of the `IMessagePassingProtocol`. That style of API
 * is a simple `onmessage` / `postMessage` pattern.
 */
export class Protocol implements IMessagePassingProtocol {
  readonly onMessage;

  constructor(private port: MessagePort) {
    // we must call start() to ensure messages are flowing
    port.start();

    this.onMessage = Event.fromDOMEventEmitter<VSBuffer>(this.port, 'message', (e: MessageEvent) => VSBuffer.wrap(e.data));
  }

  send(message: VSBuffer): void {
    this.port.postMessage(message.buffer);
  }

  disconnect(): void {
    this.port.close();
  }
}

/**
 * An implementation of a `IPCClient` on top of MessagePort style IPC communication.
 */
export class Client extends IPCClient implements IDisposable {
  private protocol: Protocol;

  constructor(port: MessagePort, clientId: string) {
    const protocol = new Protocol(port);
    super(protocol, clientId);

    this.protocol = protocol;
  }

  // eslint-disable-next-line prettier/prettier
  override dispose(): void {
    this.protocol.disconnect();
  }
}
