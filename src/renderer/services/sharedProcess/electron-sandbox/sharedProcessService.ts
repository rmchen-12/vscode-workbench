import { Barrier, timeout } from 'base/common/async';
import { Client as MessagePortClient } from 'base/parts/ipc/common/ipc.mp';
import { Disposable } from 'base/common/lifecycle';
import { IChannel, IServerChannel, getDelayedChannel } from 'base/parts/ipc/common/ipc';
import { acquirePort } from 'base/parts/ipc/electron-sandbox/ipc.mp';
// import { ILogService } from "platform/log/common/log";
import { mark } from 'base/common/performance';

export interface ISharedProcessService {
  readonly _serviceBrand: undefined;

  getChannel(channelName: string): IChannel;
  registerChannel(channelName: string, channel: IServerChannel<string>): void;

  notifyRestored(): void;
}

export class SharedProcessService extends Disposable implements ISharedProcessService {
  declare readonly _serviceBrand: undefined;

  private readonly withSharedProcessConnection: Promise<MessagePortClient>;

  private readonly restoredBarrier = new Barrier();

  // prettier-ignore
  constructor(
    readonly windowId: number,
    // @ILogService private readonly logService: ILogService
  ) {
    super();

    this.withSharedProcessConnection = this.connect();
  }

  private async connect(): Promise<MessagePortClient> {
    // Acquire a message port connected to the shared process
    mark('hi/willConnectSharedProcess');
    console.time('sharedProcess');
    const port = await acquirePort('sharedProcess');
    console.timeEnd('sharedProcess');
    mark('hi/didConnectSharedProcess');
    // this.logService.trace("Renderer->SharedProcess#connect: connection established");

    return this._register(new MessagePortClient(port, `window:${this.windowId}`));
  }

  notifyRestored(): void {
    if (!this.restoredBarrier.isOpen()) {
      this.restoredBarrier.open();
    }
  }

  getChannel(channelName: string): IChannel {
    return getDelayedChannel(this.withSharedProcessConnection.then((connection) => connection.getChannel(channelName)));
  }

  registerChannel(channelName: string, channel: IServerChannel<string>): void {
    this.withSharedProcessConnection.then((connection) => connection.registerChannel(channelName, channel));
  }
}
