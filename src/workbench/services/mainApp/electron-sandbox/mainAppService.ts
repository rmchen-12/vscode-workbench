import { Barrier, timeout } from 'base/common/async';
import { Client as MessagePortClient } from 'base/parts/ipc/common/ipc.mp';
import { Disposable } from 'base/common/lifecycle';
import { IChannel, IServerChannel, getDelayedChannel } from 'base/parts/ipc/common/ipc';
import { acquirePort } from 'base/parts/ipc/electron-sandbox/ipc.mp';
// import { ILogService } from "platform/log/common/log";
import { mark } from 'base/common/performance';

export interface IMainAppService {
  readonly _serviceBrand: undefined;

  getChannel(channelName: string): IChannel;
  registerChannel(channelName: string, channel: IServerChannel<string>): void;

  notifyRestored(): void;
}

export class MainAppService extends Disposable implements IMainAppService {
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
    // Our performance tests show that a connection to the shared
    // process can have significant overhead to the startup time
    // of the window because the shared process could be created
    // as a result. As such, make sure we await the `Restored`
    // phase before making a connection attempt, but also add a
    // timeout to be safe against possible deadlocks.
    // await Promise.race([this.restoredBarrier.wait(), timeout(2000)]);

    // Acquire a message port connected to the shared process
    // mark('hi/willConnectSharedProcess');
    // this.logService.trace("Renderer->SharedProcess#connect: before acquirePort");
    console.time('mainApp')
    const port = await acquirePort('mainApp');
    console.timeEnd('mainApp')
    // mark('hi/didConnectSharedProcess');
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
