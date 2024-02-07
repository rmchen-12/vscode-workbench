import { Barrier } from 'base/common/async';
import { Client as MessagePortClient } from 'base/parts/ipc/common/ipc.mp';
import { Disposable } from 'base/common/lifecycle';
import { IChannel, IServerChannel, getDelayedChannel } from 'base/parts/ipc/common/ipc';
import { acquirePort } from 'base/parts/ipc/electron-sandbox/ipc.mp';
import { mark } from 'base/common/performance';

export interface IMainAppService {
  readonly _serviceBrand: undefined;

  getChannel(channelName: string): IChannel;
  registerChannel(channelName: string, channel: IServerChannel<string>): void;

  notifyRestored(): void;
}

export class MainAppService extends Disposable implements IMainAppService {
  declare readonly _serviceBrand: undefined;

  private readonly withMainAppConnection: Promise<MessagePortClient>;

  private readonly restoredBarrier = new Barrier();

  constructor(readonly windowId: string) {
    super();

    this.withMainAppConnection = this.connect();
  }

  private async connect(): Promise<MessagePortClient> {
    // Acquire a message port connected to the shared process
    mark('hi/willConnectMainApp');
    console.time('mainApp');
    const port = await acquirePort('mainApp');
    console.timeEnd('mainApp');
    mark('hi/didConnectMainApp');

    return this._register(new MessagePortClient(port, `window:${this.windowId}`));
  }

  notifyRestored(): void {
    if (!this.restoredBarrier.isOpen()) {
      this.restoredBarrier.open();
    }
  }

  getChannel(channelName: string): IChannel {
    return getDelayedChannel(this.withMainAppConnection.then((connection) => connection.getChannel(channelName)));
  }

  registerChannel(channelName: string, channel: IServerChannel<string>): void {
    this.withMainAppConnection.then((connection) => connection.registerChannel(channelName, channel));
  }
}
