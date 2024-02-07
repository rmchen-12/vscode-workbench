import * as Assert from 'src/base/common/assert';
import { IAuthenticationService } from 'src/platform/authentication/electron-sandbox/authentication';
import { ServiceIdentifier } from 'src/platform/instantiation/instantiation';
// import { ILoggerService } from 'src/platform/logger/common/logger';
import { ITickTimerService } from 'src/platform/tickTimer/common/tickTimer';

interface IServices {
  // logger: ILoggerService;
  authentication: IAuthenticationService;
  tickTimer: ITickTimerService;
}

class Registry {
  readonly _entries = new Map<ServiceIdentifier<any>, any>();
  readonly identifierEntries = new Map<string, ServiceIdentifier<any>>();

  public add<T extends object>(id: ServiceIdentifier<T>, servicesMap: { [key: string]: string[] }, instance: T): this {
    Assert.ok(!this._entries.has(id), `There is already an extension with this id: ${id}`);
    const key = id.toString().split('Service')[0];
    const instanceMethods = servicesMap[key];

    // 代理对象，对 apiMap 中未提供的方法进行过滤，不予调用成功
    const proxyInstance = new Proxy(instance, {
      get: function (target: any, prop: string) {
        const originalMethod = target[prop];
        return function (...args: any[]) {
          if (instanceMethods.includes(prop)) {
            const result = originalMethod.apply(instance, args);
            return result;
          } else {
            return Promise.reject(`模块【${key}】上的 ${prop} 方法未支持`);
          }
        };
      },
    });

    this._entries.set(id, proxyInstance);

    // loggerService => logger
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
