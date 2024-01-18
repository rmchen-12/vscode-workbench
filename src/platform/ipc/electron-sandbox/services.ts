//#region Shared Process

import { IChannel, IServerChannel, ProxyChannel } from 'src/base/parts/ipc/common/ipc';
import { SyncDescriptor } from 'src/platform/instantiation/instantiationService';
import { registerSingleton } from 'src/platform/instantiation/extensions';
import { ServiceIdentifier, createDecorator } from 'src/platform/instantiation/instantiation';

type ChannelClientCtor<T> = { new (channel: IChannel): T };
type Remote = { getChannel(channelName: string): IChannel };

abstract class RemoteServiceStub<T extends object> {
  // prettier-ignore
  constructor(
    channelName: string,
    options: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions | undefined,
    remote: Remote,
  ) {
    const channel = remote.getChannel(channelName);

    if (isRemoteServiceWithChannelClientOptions(options)) {
      return new options.channelClientCtor(channel);
    }

    return ProxyChannel.toService(channel, options?.proxyOptions);
  }
}

export interface IBaseRemoteServiceOptions {
  readonly supportsDelayedInstantiation?: boolean;
}

export interface IRemoteServiceWithChannelClientOptions<T> extends IBaseRemoteServiceOptions {
  readonly channelClientCtor: ChannelClientCtor<T>;
}

export interface IRemoteServiceWithProxyOptions extends IBaseRemoteServiceOptions {
  readonly proxyOptions?: ProxyChannel.ICreateProxyServiceOptions;
}

function isRemoteServiceWithChannelClientOptions<T>(obj: unknown): obj is IRemoteServiceWithChannelClientOptions<T> {
  const candidate = obj as IRemoteServiceWithChannelClientOptions<T> | undefined;

  return !!candidate?.channelClientCtor;
}

//#region Iframe

export const IMainProcessService = createDecorator<IMainProcessService>('mainProcessService');

export interface IMainProcessService {
  readonly _serviceBrand: undefined;

  getChannel(channelName: string): IChannel;
  registerChannel(channelName: string, channel: IServerChannel<string>): void;

  notifyRestored(): void;
}

class IMainProcessRemoteServiceStub<T extends object> extends RemoteServiceStub<T> {
  constructor(channelName: string, options: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions | undefined, @IMainProcessService ipcService: IMainProcessService) {
    super(channelName, options, ipcService);
  }
}

export function registerMainProcessRemoteService<T>(id: ServiceIdentifier<T>, channelName: string, options?: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions): void {
  registerSingleton(id, new SyncDescriptor(IMainProcessRemoteServiceStub, [channelName, options], options?.supportsDelayedInstantiation));
}

//#endregion

//#region Shared Process

export const ISharedProcessService = createDecorator<ISharedProcessService>('sharedProcessService');

export interface ISharedProcessService {
  readonly _serviceBrand: undefined;

  getChannel(channelName: string): IChannel;
  registerChannel(channelName: string, channel: IServerChannel<string>): void;

  notifyRestored(): void;
}

class SharedProcessRemoteServiceStub<T extends object> extends RemoteServiceStub<T> {
  constructor(channelName: string, options: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions | undefined, @ISharedProcessService ipcService: ISharedProcessService) {
    super(channelName, options, ipcService);
  }
}

export function registerSharedProcessRemoteService<T>(id: ServiceIdentifier<T>, channelName: string, options?: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions): void {
  registerSingleton(id, new SyncDescriptor(SharedProcessRemoteServiceStub, [channelName, options], options?.supportsDelayedInstantiation));
}

//#endregion

//#region MainApp

export const IMainAppService = createDecorator<IMainAppService>('mainAppService');

export interface IMainAppService {
  readonly _serviceBrand: undefined;

  getChannel(channelName: string): IChannel;
  registerChannel(channelName: string, channel: IServerChannel<string>): void;

  notifyRestored(): void;
}

class MainAppRemoteServiceStub<T extends object> extends RemoteServiceStub<T> {
  constructor(channelName: string, options: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions | undefined, @IMainAppService ipcService: IMainAppService) {
    super(channelName, options, ipcService);
  }
}

export function registerMainAppRemoteService<T>(id: ServiceIdentifier<T>, channelName: string, options?: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions): void {
  registerSingleton(id, new SyncDescriptor(MainAppRemoteServiceStub, [channelName, options], options?.supportsDelayedInstantiation));
}

//#endregion
