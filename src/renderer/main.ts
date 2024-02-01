import { Disposable } from 'src/base/common/lifecycle';
import { mark } from 'src/base/common/performance';
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

type RenderCallback = () => Promise<void> | void;

export const map = {
  main: {
    authentication: ['login', 'chooseContact'],
  },
  mainApp: {
    tickTimer: ['mark', 'spm'],
  },
  sharedProcess: {
    logger: ['info', 'error'],
  },
};

export const servicesMap = (Object as any).values(map).reduce((p: any, c: any) => {
  return { ...p, ...c };
}, {});

export class Workbench extends Disposable {
  declare readonly _serviceBrand: undefined;

  readonly serviceMap = new Map<string, ServiceIdentifier<any>>();

  constructor(private readonly serviceCollection: ServiceCollection) {
    super();
  }

  startup(render: RenderCallback) {
    // Services
    const instantiationService = this.initServices(this.serviceCollection);

    instantiationService.invokeFunction(async (accessor) => {
      services.authentication.login(1).then((e: any) => console.log(e));
      services.logger.error('bosszp', 'jlkjlkj');
      services.tickTimer.spm('spm').then(console.log);

      services.authentication.getList()

      // 执行 new vue()
      await render();
    });
  }

  private initServices(serviceCollection: ServiceCollection): IInstantiationService {
    for (const [key, value] of (Object as any).entries(map)) {
      if (key === 'main') {
        const mainProcessServices = value;

        for (const [serviceName, serviceMethods] of (Object as any).entries(mainProcessServices)) {
          const id = createDecorator(serviceName);
          this.serviceMap.set(serviceName, id);
          registerMainProcessRemoteService(id, serviceName);
        }
      }

      if (key === 'mainApp') {
        const mainAppServices = value;

        for (const [serviceName, serviceMethods] of (Object as any).entries(mainAppServices)) {
          const id = createDecorator(serviceName);
          this.serviceMap.set(serviceName, id);
          registerMainAppRemoteService(id, serviceName);
        }
      }

      if (key === 'sharedProcess') {
        const sharedProcessServices = value;

        for (const [serviceName, serviceMethods] of (Object as any).entries(sharedProcessServices)) {
          const id = createDecorator(serviceName);
          this.serviceMap.set(serviceName, id);
          registerSharedProcessRemoteService(id, serviceName);
        }
      }
    }

    // All Contributed Services
    const contributedServices = getSingletonServiceDescriptors();
    for (let [id, descriptor] of contributedServices) {
      serviceCollection.set(id, descriptor);
    }

    const instantiationService = new InstantiationService(serviceCollection, true);

    // Wrap up
    instantiationService.invokeFunction((accessor) => {
      // 将注册的服务都加入 servicesRegistry 中
      for (let [id, descriptor] of contributedServices) {
        servicesRegistry.add(id, accessor.get(id));
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
    const services = await this.initServices();

    mark('code/willStartWorkbench');

    // Create Workbench
    const workbench = new Workbench(services.serviceCollection);

    // Startup
    workbench.startup(render);
  }

  private async initServices(): Promise<{ serviceCollection: ServiceCollection }> {
    const serviceCollection = new ServiceCollection();

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT ADD ANY OTHER SERVICE INTO THE COLLECTION HERE.
    // CONTRIBUTE IT VIA WORKBENCH.WEB.MAIN.TS AND registerSingleton().
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // Main Process
    if (isDefined(map['main'])) {
      const mainProcessService = new MainProcessService(1);
      serviceCollection.set(IMainProcessService, mainProcessService);
    }

    // Shared Process
    if (isDefined(map['sharedProcess'])) {
      const sharedProcessService = new SharedProcessService(1);
      serviceCollection.set(ISharedProcessService, sharedProcessService);
    }

    // MainApp
    if (isDefined(map['mainApp'])) {
      const mainAppService = new MainAppService(1);
      serviceCollection.set(IMainAppService, mainAppService);
    }

    return { serviceCollection };
  }
}

console.time('render');

const connect = new Main();

connect.open(() => {
  console.timeEnd('render');
  document.body.innerHTML = '123123';
});
