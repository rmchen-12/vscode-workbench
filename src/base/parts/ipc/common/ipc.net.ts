/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from "base/common/buffer";
import { Emitter, Event } from "base/common/event";
import { Disposable, IDisposable } from "base/common/lifecycle";
import { IMessagePassingProtocol } from "base/parts/ipc/common/ipc";

export const enum SocketDiagnosticsEventType {
  Created = "created",
  Read = "read",
  Write = "write",
  Open = "open",
  Error = "error",
  Close = "close",

  BrowserWebSocketBlobReceived = "browserWebSocketBlobReceived",

  NodeEndReceived = "nodeEndReceived",
  NodeEndSent = "nodeEndSent",
  NodeDrainBegin = "nodeDrainBegin",
  NodeDrainEnd = "nodeDrainEnd",

  zlibInflateError = "zlibInflateError",
  zlibInflateData = "zlibInflateData",
  zlibInflateInitialWrite = "zlibInflateInitialWrite",
  zlibInflateInitialFlushFired = "zlibInflateInitialFlushFired",
  zlibInflateWrite = "zlibInflateWrite",
  zlibInflateFlushFired = "zlibInflateFlushFired",
  zlibDeflateError = "zlibDeflateError",
  zlibDeflateData = "zlibDeflateData",
  zlibDeflateWrite = "zlibDeflateWrite",
  zlibDeflateFlushFired = "zlibDeflateFlushFired",

  WebSocketNodeSocketWrite = "webSocketNodeSocketWrite",
  WebSocketNodeSocketPeekedHeader = "webSocketNodeSocketPeekedHeader",
  WebSocketNodeSocketReadHeader = "webSocketNodeSocketReadHeader",
  WebSocketNodeSocketReadData = "webSocketNodeSocketReadData",
  WebSocketNodeSocketUnmaskedData = "webSocketNodeSocketUnmaskedData",
  WebSocketNodeSocketDrainBegin = "webSocketNodeSocketDrainBegin",
  WebSocketNodeSocketDrainEnd = "webSocketNodeSocketDrainEnd",

  ProtocolHeaderRead = "protocolHeaderRead",
  ProtocolMessageRead = "protocolMessageRead",
  ProtocolHeaderWrite = "protocolHeaderWrite",
  ProtocolMessageWrite = "protocolMessageWrite",
  ProtocolWrite = "protocolWrite",
}

export namespace SocketDiagnostics {
  export const enableDiagnostics = false;

  export interface IRecord {
    timestamp: number;
    id: string;
    label: string;
    type: SocketDiagnosticsEventType;
    buff?: VSBuffer;
    data?: any;
  }

  export const records: IRecord[] = [];
  const socketIds = new WeakMap<any, string>();
  let lastUsedSocketId = 0;

  function getSocketId(nativeObject: any, label: string): string {
    if (!socketIds.has(nativeObject)) {
      const id = String(++lastUsedSocketId);
      socketIds.set(nativeObject, id);
    }
    return socketIds.get(nativeObject)!;
  }

  export function traceSocketEvent(nativeObject: any, socketDebugLabel: string, type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void {
    if (!enableDiagnostics) {
      return;
    }
    const id = getSocketId(nativeObject, socketDebugLabel);

    if (data instanceof VSBuffer || data instanceof Uint8Array || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      const copiedData = VSBuffer.alloc(data.byteLength);
      copiedData.set(data);
      records.push({ timestamp: Date.now(), id, label: socketDebugLabel, type, buff: copiedData });
    } else {
      // data is a custom object
      records.push({ timestamp: Date.now(), id, label: socketDebugLabel, type, data: data });
    }
  }
}

export const enum SocketCloseEventType {
  NodeSocketCloseEvent = 0,
  WebSocketCloseEvent = 1,
}

export interface NodeSocketCloseEvent {
  /**
   * The type of the event
   */
  readonly type: SocketCloseEventType.NodeSocketCloseEvent;
  /**
   * `true` if the socket had a transmission error.
   */
  readonly hadError: boolean;
  /**
   * Underlying error.
   */
  readonly error: Error | undefined;
}

export type SocketCloseEvent = NodeSocketCloseEvent | undefined;

export interface SocketTimeoutEvent {
  readonly unacknowledgedMsgCount: number;
  readonly timeSinceOldestUnacknowledgedMsg: number;
  readonly timeSinceLastReceivedSomeData: number;
}

export interface ISocket extends IDisposable {
  onData(listener: (e: VSBuffer) => void): IDisposable;
  onClose(listener: (e: SocketCloseEvent) => void): IDisposable;
  onEnd(listener: () => void): IDisposable;
  write(buffer: VSBuffer): void;
  end(): void;
  drain(): Promise<void>;

  traceSocketEvent(type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void;
}

let emptyBuffer: VSBuffer | null = null;
function getEmptyBuffer(): VSBuffer {
  if (!emptyBuffer) {
    emptyBuffer = VSBuffer.alloc(0);
  }
  return emptyBuffer;
}

export class ChunkStream {
  private _chunks: VSBuffer[];
  private _totalLength: number;

  public get byteLength() {
    return this._totalLength;
  }

  constructor() {
    this._chunks = [];
    this._totalLength = 0;
  }

  public acceptChunk(buff: VSBuffer) {
    this._chunks.push(buff);
    this._totalLength += buff.byteLength;
  }

  public read(byteCount: number): VSBuffer {
    return this._read(byteCount, true);
  }

  public peek(byteCount: number): VSBuffer {
    return this._read(byteCount, false);
  }

  private _read(byteCount: number, advance: boolean): VSBuffer {
    if (byteCount === 0) {
      return getEmptyBuffer();
    }

    if (byteCount > this._totalLength) {
      throw new Error(`Cannot read so many bytes!`);
    }

    if (this._chunks[0].byteLength === byteCount) {
      // super fast path, precisely first chunk must be returned
      const result = this._chunks[0];
      if (advance) {
        this._chunks.shift();
        this._totalLength -= byteCount;
      }
      return result;
    }

    if (this._chunks[0].byteLength > byteCount) {
      // fast path, the reading is entirely within the first chunk
      const result = this._chunks[0].slice(0, byteCount);
      if (advance) {
        this._chunks[0] = this._chunks[0].slice(byteCount);
        this._totalLength -= byteCount;
      }
      return result;
    }

    const result = VSBuffer.alloc(byteCount);
    let resultOffset = 0;
    let chunkIndex = 0;
    while (byteCount > 0) {
      const chunk = this._chunks[chunkIndex];
      if (chunk.byteLength > byteCount) {
        // this chunk will survive
        const chunkPart = chunk.slice(0, byteCount);
        result.set(chunkPart, resultOffset);
        resultOffset += byteCount;

        if (advance) {
          this._chunks[chunkIndex] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
        }

        byteCount -= byteCount;
      } else {
        // this chunk will be entirely read
        result.set(chunk, resultOffset);
        resultOffset += chunk.byteLength;

        if (advance) {
          this._chunks.shift();
          this._totalLength -= chunk.byteLength;
        } else {
          chunkIndex++;
        }

        byteCount -= chunk.byteLength;
      }
    }
    return result;
  }
}

const enum ProtocolMessageType {
  None = 0,
  Regular = 1,
  Control = 2,
  Ack = 3,
  Disconnect = 5,
  ReplayRequest = 6,
  Pause = 7,
  Resume = 8,
  KeepAlive = 9,
  LatencyMeasurementRequest = 10,
  LatencyMeasurementResponse = 11,
}

function protocolMessageTypeToString(messageType: ProtocolMessageType) {
  switch (messageType) {
    case ProtocolMessageType.None:
      return "None";
    case ProtocolMessageType.Regular:
      return "Regular";
    case ProtocolMessageType.Control:
      return "Control";
    case ProtocolMessageType.Ack:
      return "Ack";
    case ProtocolMessageType.Disconnect:
      return "Disconnect";
    case ProtocolMessageType.ReplayRequest:
      return "ReplayRequest";
    case ProtocolMessageType.Pause:
      return "PauseWriting";
    case ProtocolMessageType.Resume:
      return "ResumeWriting";
    case ProtocolMessageType.KeepAlive:
      return "KeepAlive";
    case ProtocolMessageType.LatencyMeasurementRequest:
      return "LatencyMeasurementRequest";
    case ProtocolMessageType.LatencyMeasurementResponse:
      return "LatencyMeasurementResponse";
  }
}

export const enum ProtocolConstants {
  HeaderLength = 13,
  /**
   * Send an Acknowledge message at most 2 seconds later...
   */
  AcknowledgeTime = 2000, // 2 seconds
  /**
   * If there is a sent message that has been unacknowledged for 20 seconds,
   * and we didn't see any incoming server data in the past 20 seconds,
   * then consider the connection has timed out.
   */
  TimeoutTime = 20000, // 20 seconds
  /**
   * If there is no reconnection within this time-frame, consider the connection permanently closed...
   */
  ReconnectionGraceTime = 3 * 60 * 60 * 1000, // 3hrs
  /**
   * Maximal grace time between the first and the last reconnection...
   */
  ReconnectionShortGraceTime = 5 * 60 * 1000, // 5min
  /**
   * Send a message every 5 seconds to avoid that the connection is closed by the OS.
   */
  KeepAliveSendTime = 5000, // 5 seconds
  /**
   * Measure the latency every 1 minute.
   */
  LatencySampleTime = 1 * 60 * 1000, // 1 minute
  /**
   * Keep the last 5 samples for latency measurement.
   */
  LatencySampleCount = 5,
  /**
   * A latency over 1s will be considered high.
   */
  HighLatencyTimeThreshold = 1000,
  /**
   * Having 3 or more samples with high latency will trigger a high latency event.
   */
  HighLatencySampleThreshold = 3,
}

class ProtocolMessage {
  public writtenTime: number;

  constructor(public readonly type: ProtocolMessageType, public readonly id: number, public readonly ack: number, public readonly data: VSBuffer) {
    this.writtenTime = 0;
  }

  public get size(): number {
    return this.data.byteLength;
  }
}

class ProtocolReader extends Disposable {
  private readonly _socket: ISocket;
  private _isDisposed: boolean;
  private readonly _incomingData: ChunkStream;
  public lastReadTime: number;

  private readonly _onMessage = this._register(new Emitter<ProtocolMessage>());
  public readonly onMessage: Event<ProtocolMessage> = this._onMessage.event;

  private readonly _state = {
    readHead: true,
    readLen: ProtocolConstants.HeaderLength,
    messageType: ProtocolMessageType.None,
    id: 0,
    ack: 0,
  };

  constructor(socket: ISocket) {
    super();
    this._socket = socket;
    this._isDisposed = false;
    this._incomingData = new ChunkStream();
    this._register(this._socket.onData(data => this.acceptChunk(data)));
    this.lastReadTime = Date.now();
  }

  public acceptChunk(data: VSBuffer | null): void {
    if (!data || data.byteLength === 0) {
      return;
    }

    this.lastReadTime = Date.now();

    this._incomingData.acceptChunk(data);

    while (this._incomingData.byteLength >= this._state.readLen) {
      const buff = this._incomingData.read(this._state.readLen);

      if (this._state.readHead) {
        // buff is the header

        // save new state => next time will read the body
        this._state.readHead = false;
        this._state.readLen = buff.readUInt32BE(9);
        this._state.messageType = buff.readUInt8(0);
        this._state.id = buff.readUInt32BE(1);
        this._state.ack = buff.readUInt32BE(5);

        this._socket.traceSocketEvent(SocketDiagnosticsEventType.ProtocolHeaderRead, { messageType: protocolMessageTypeToString(this._state.messageType), id: this._state.id, ack: this._state.ack, messageSize: this._state.readLen });
      } else {
        // buff is the body
        const messageType = this._state.messageType;
        const id = this._state.id;
        const ack = this._state.ack;

        // save new state => next time will read the header
        this._state.readHead = true;
        this._state.readLen = ProtocolConstants.HeaderLength;
        this._state.messageType = ProtocolMessageType.None;
        this._state.id = 0;
        this._state.ack = 0;

        this._socket.traceSocketEvent(SocketDiagnosticsEventType.ProtocolMessageRead, buff);

        this._onMessage.fire(new ProtocolMessage(messageType, id, ack, buff));

        if (this._isDisposed) {
          // check if an event listener lead to our disposal
          break;
        }
      }
    }
  }

  public readEntireBuffer(): VSBuffer {
    return this._incomingData.read(this._incomingData.byteLength);
  }

  public override dispose(): void {
    this._isDisposed = true;
    super.dispose();
  }
}

class ProtocolWriter {
  private _isDisposed: boolean;
  private _isPaused: boolean;
  private readonly _socket: ISocket;
  private _data: VSBuffer[];
  private _totalLength: number;
  public lastWriteTime: number;

  constructor(socket: ISocket) {
    this._isDisposed = false;
    this._isPaused = false;
    this._socket = socket;
    this._data = [];
    this._totalLength = 0;
    this.lastWriteTime = 0;
  }

  public dispose(): void {
    try {
      this.flush();
    } catch (err) {
      // ignore error, since the socket could be already closed
    }
    this._isDisposed = true;
  }

  public drain(): Promise<void> {
    this.flush();
    return this._socket.drain();
  }

  public flush(): void {
    // flush
    this._writeNow();
  }

  public pause(): void {
    this._isPaused = true;
  }

  public resume(): void {
    this._isPaused = false;
    this._scheduleWriting();
  }

  public write(msg: ProtocolMessage) {
    if (this._isDisposed) {
      // ignore: there could be left-over promises which complete and then
      // decide to write a response, etc...
      return;
    }
    msg.writtenTime = Date.now();
    this.lastWriteTime = Date.now();
    const header = VSBuffer.alloc(ProtocolConstants.HeaderLength);
    header.writeUInt8(msg.type, 0);
    header.writeUInt32BE(msg.id, 1);
    header.writeUInt32BE(msg.ack, 5);
    header.writeUInt32BE(msg.data.byteLength, 9);

    this._socket.traceSocketEvent(SocketDiagnosticsEventType.ProtocolHeaderWrite, { messageType: protocolMessageTypeToString(msg.type), id: msg.id, ack: msg.ack, messageSize: msg.data.byteLength });
    this._socket.traceSocketEvent(SocketDiagnosticsEventType.ProtocolMessageWrite, msg.data);

    this._writeSoon(header, msg.data);
  }

  private _bufferAdd(head: VSBuffer, body: VSBuffer): boolean {
    const wasEmpty = this._totalLength === 0;
    this._data.push(head, body);
    this._totalLength += head.byteLength + body.byteLength;
    return wasEmpty;
  }

  private _bufferTake(): VSBuffer {
    const ret = VSBuffer.concat(this._data, this._totalLength);
    this._data.length = 0;
    this._totalLength = 0;
    return ret;
  }

  private _writeSoon(header: VSBuffer, data: VSBuffer): void {
    if (this._bufferAdd(header, data)) {
      this._scheduleWriting();
    }
  }

  private _writeNowTimeout: any = null;
  private _scheduleWriting(): void {
    if (this._writeNowTimeout) {
      return;
    }
    this._writeNowTimeout = setTimeout(() => {
      this._writeNowTimeout = null;
      this._writeNow();
    });
  }

  private _writeNow(): void {
    if (this._totalLength === 0) {
      return;
    }
    if (this._isPaused) {
      return;
    }
    const data = this._bufferTake();
    this._socket.traceSocketEvent(SocketDiagnosticsEventType.ProtocolWrite, { byteLength: data.byteLength });
    this._socket.write(data);
  }
}

/**
 * A message has the following format:
 * ```
 *     /-------------------------------|------\
 *     |             HEADER            |      |
 *     |-------------------------------| DATA |
 *     | TYPE | ID | ACK | DATA_LENGTH |      |
 *     \-------------------------------|------/
 * ```
 * The header is 9 bytes and consists of:
 *  - TYPE is 1 byte (ProtocolMessageType) - the message type
 *  - ID is 4 bytes (u32be) - the message id (can be 0 to indicate to be ignored)
 *  - ACK is 4 bytes (u32be) - the acknowledged message id (can be 0 to indicate to be ignored)
 *  - DATA_LENGTH is 4 bytes (u32be) - the length in bytes of DATA
 *
 * Only Regular messages are counted, other messages are not counted, nor acknowledged.
 */
export class Protocol extends Disposable implements IMessagePassingProtocol {
  private _socket: ISocket;
  private _socketWriter: ProtocolWriter;
  private _socketReader: ProtocolReader;

  private readonly _onMessage = new Emitter<VSBuffer>();
  readonly onMessage: Event<VSBuffer> = this._onMessage.event;

  private readonly _onDidDispose = new Emitter<void>();
  readonly onDidDispose: Event<void> = this._onDidDispose.event;

  constructor(socket: ISocket) {
    super();
    this._socket = socket;
    this._socketWriter = this._register(new ProtocolWriter(this._socket));
    this._socketReader = this._register(new ProtocolReader(this._socket));

    this._register(
      this._socketReader.onMessage(msg => {
        if (msg.type === ProtocolMessageType.Regular) {
          this._onMessage.fire(msg.data);
        }
      })
    );

    this._register(this._socket.onClose(() => this._onDidDispose.fire()));
  }

  drain(): Promise<void> {
    return this._socketWriter.drain();
  }

  getSocket(): ISocket {
    return this._socket;
  }

  sendDisconnect(): void {
    // Nothing to do...
  }

  send(buffer: VSBuffer): void {
    this._socketWriter.write(new ProtocolMessage(ProtocolMessageType.Regular, 0, 0, buffer));
  }
}
