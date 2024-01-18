import * as Assert from 'base/common/assert';
import { IAuthenticationService } from 'src/platform/authentication/electron-sandbox/authentication';
import { ServiceIdentifier } from 'src/platform/instantiation/instantiation';
import { ILoggerService } from 'src/platform/logger/common/logger';
import { ITickTimerService } from 'src/platform/tickTimer/common/tickTimer';

interface IServices {
  logger: ILoggerService;
  authentication: IAuthenticationService;
  tickTimer: ITickTimerService;
}

class Registry {
  readonly _entries = new Map<ServiceIdentifier<any>, any>();
  readonly identifierEntries = new Map<string, ServiceIdentifier<any>>();

  public add<T>(id: ServiceIdentifier<T>, instance: T): this {
    Assert.ok(!this._entries.has(id), `There is already an extension with this id: ${id}`);
    this._entries.set(id, instance);

    // loggerService => logger
    const key = id.toString().split('Service')[0];
    this.identifierEntries.set(key, id);
    return this;
  }

  public konws(id: ServiceIdentifier<any>): boolean {
    return this._entries.has(id);
  }

  public as<T>(id: ServiceIdentifier<T>): T {
    return this._entries.get(id);
  }

  public dispose() {
    this._entries.clear();
  }
}

export const servicesRegistry = new Registry();

// FIXME: 访问到不存在的属性还是会报错
export const services = new Proxy(servicesRegistry, {
  get(_target, propKey: string) {
    try {
      const serviceIdentifier = _target.identifierEntries.get(propKey);
      if (!serviceIdentifier) {
        throw new Error(`${propKey} 未在该进程中注册`);
      }
      return _target.as(serviceIdentifier);
    } catch (error) {
      console.error(error);
    }
  },
}) as unknown as IServices;
