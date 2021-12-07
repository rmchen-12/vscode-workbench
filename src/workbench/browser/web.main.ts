import { setFullscreen } from "src/base/browser/browser";
import { detectFullscreen, domContentLoaded } from "src/base/browser/dom";
import { Disposable } from "src/base/common/lifecycle";
import { mark } from "src/base/common/performance";
import { IWorkbench } from "src/main";
import { ServiceCollection } from "src/platform/instantiation/serviceCollection";
import { BrowserWindow } from "src/workbench/browser/window";
import { Workbench } from "src/workbench/browser/workbench";
import { ILifecycleService } from "src/workbench/services/lifecycle/common/lifecycle";

class BrowserMain extends Disposable {

  constructor(
    private readonly domElement: HTMLElement,
  ) {
    super();

    this.init();
  }

  private init(): void {

    // Browser config
    setFullscreen(!!detectFullscreen());
  }

  async open(): Promise<IWorkbench> {
    const services = await this.initServices();

    await domContentLoaded();
    mark('code/willStartWorkbench');

    // Create Workbench
    const workbench = new Workbench(this.domElement, services.serviceCollection);

    // Listeners
    this.registerListeners(workbench);

    // Startup
    const instantiationService = workbench.startup();

    // Window
    this._register(instantiationService.createInstance(BrowserWindow));

    // Return API Facade
    return instantiationService.invokeFunction(accessor => {
      const lifecycleService = accessor.get(ILifecycleService);

      return { shutdown: () => lifecycleService.shutdown() };
    });
  }

  private async initServices(): Promise<{ serviceCollection: ServiceCollection; }> {
    const serviceCollection = new ServiceCollection();

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT ADD ANY OTHER SERVICE INTO THE COLLECTION HERE.
    // CONTRIBUTE IT VIA WORKBENCH.WEB.MAIN.TS AND registerSingleton().
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // // Userdata Sync Store Management Service
    // const userDataSyncStoreManagementService = new UserDataSyncStoreManagementService(productService, configurationService, storageService);
    // serviceCollection.set(IUserDataSyncStoreManagementService, userDataSyncStoreManagementService);

    return { serviceCollection };
  }

  private registerListeners(workbench: Workbench): void {

    // Workbench Lifecycle
    this._register(workbench.onBeforeShutdown(() => { }));
    this._register(workbench.onWillShutdown(() => { }));
    this._register(workbench.onShutdown(() => this.dispose()));
  }
}

export function main(domElement: HTMLElement): Promise<IWorkbench> {
  const workbench = new BrowserMain(domElement);

  return workbench.open();
}
