import { Disposable } from 'src/base/common/lifecycle';
import { mark } from 'src/base/common/performance';
import { Event } from 'base/common/event';
import { ServiceCollection } from 'src/platform/instantiation/serviceCollection';
import { IMainProcessService, IMainAppService, ISharedProcessService, registerMainAppRemoteService, registerMainProcessRemoteService, registerSharedProcessRemoteService } from 'src/platform/ipc/electron-sandbox/services';
import { SharedProcessService } from './services/sharedProcess/electron-sandbox/sharedProcessService';
import { MainAppService } from './services/mainApp/electron-sandbox/mainAppService';
import { MainProcessService } from './services/mainProcess/electron-sandbox/mainProcessService';
import { IInstantiationService, ServiceIdentifier, createDecorator } from 'src/platform/instantiation/instantiation';
import { getSingletonServiceDescriptors } from 'src/platform/instantiation/extensions';
import { InstantiationService } from 'src/platform/instantiation/instantiationService';
import { services, servicesRegistry } from './services';
import { isDefined } from 'src/base/common/types';
import { generateUuid } from 'src/base/common/uuid';
export { services } from './services';

type RenderCallback = () => Promise<void> | void;

interface IApiMap {
  main?: { [key: string]: string[] };
  mainApp?: { [key: string]: string[] };
  sharedProcess?: { [key: string]: string[] };
}

export class Workbench extends Disposable {
  declare readonly _serviceBrand: undefined;

  readonly serviceMap = new Map<string, ServiceIdentifier<any>>();

  constructor(private readonly serviceCollection: ServiceCollection) {
    super();
  }

  startup(render: RenderCallback, apiMap: IApiMap) {
    // Services
    const instantiationService = this.initServices(this.serviceCollection, apiMap);

    instantiationService.invokeFunction(async (accessor) => {
      // 执行 new vue()
      await render();
    });
  }

  // 根据 apiMap 循环注册
  private initServices(serviceCollection: ServiceCollection, apiMap: IApiMap): IInstantiationService {
    for (const [key, value] of Object.entries(apiMap)) {
      const services = value;

      for (const [serviceName] of Object.entries(services)) {
        const id = createDecorator(serviceName);
        this.serviceMap.set(serviceName, id);

        if (key === 'main') {
          registerMainProcessRemoteService(id, serviceName);
        }
        if (key === 'mainApp') {
          registerMainAppRemoteService(id, serviceName);
        }

        if (key === 'sharedProcess') {
          registerSharedProcessRemoteService(id, serviceName);
        }
      }
    }

    // All Contributed Services
    const contributedServices = getSingletonServiceDescriptors();
    for (let [id, descriptor] of contributedServices) {
      serviceCollection.set(id, descriptor);
    }

    const servicesMap = Object.values(apiMap).reduce((p: any, c: any) => ({ ...p, ...c }), {});
    const instantiationService = new InstantiationService(serviceCollection, true);

    // Wrap up
    instantiationService.invokeFunction((accessor) => {
      // 将注册的服务都加入 servicesRegistry 中
      for (let [id, descriptor] of contributedServices) {
        servicesRegistry.add(id, servicesMap, accessor.get(id));
      }
    });

    return instantiationService;
  }
}

class Main extends Disposable {
  constructor() {
    super();

    this.init();
  }

  private init(): void {
    // Browser config
  }

  async open(render: RenderCallback) {
    const { apiMap, nonce } = await this.initData();

    const services = await this.initServices(nonce, apiMap);

    mark('code/willStartWorkbench');

    // Create Workbench
    const workbench = new Workbench(services.serviceCollection);

    // Startup
    workbench.startup(render, apiMap);
  }

  private async initData() {
    const nonce = generateUuid();
    window.parent.postMessage(nonce, '*');

    const onMessageChannelResult = Event.fromDOMEventEmitter<{ nonce: string; apiMap: IApiMap }>(window, 'message', (e: MessageEvent) => ({ nonce: e.data.nonce, apiMap: e.data.apiMap }));
    const { apiMap } = await Event.toPromise(Event.once(Event.filter(onMessageChannelResult, (e) => e.nonce === nonce)));

    return { apiMap, nonce };
  }

  private async initServices(nonce: string, apiMap: IApiMap): Promise<{ serviceCollection: ServiceCollection }> {
    const serviceCollection = new ServiceCollection();

    // Main Process
    if (isDefined(apiMap['main'])) {
      const mainProcessService = new MainProcessService(nonce);
      serviceCollection.set(IMainProcessService, mainProcessService);
    }

    // Shared Process
    if (isDefined(apiMap['sharedProcess'])) {
      const sharedProcessService = new SharedProcessService(nonce);
      serviceCollection.set(ISharedProcessService, sharedProcessService);
    }

    // MainApp
    if (isDefined(apiMap['mainApp'])) {
      const mainAppService = new MainAppService(nonce);
      serviceCollection.set(IMainAppService, mainAppService);
    }

    return { serviceCollection };
  }
}

export const app = new Main();
