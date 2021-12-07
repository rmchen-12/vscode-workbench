import 'src/workbench/workbench.web.main';
import { main } from 'src/workbench/browser/web.main';
import { IDisposable, toDisposable } from 'src/base/common/lifecycle';

export interface IWorkbench {
  shutdown: () => void;
}

let workbenchPromiseResolve: Function;
const workbenchPromise = new Promise<IWorkbench>(resolve => workbenchPromiseResolve = resolve);
function create(domElement: HTMLElement): IDisposable {

  // Startup workbench and resolve waiters
  let instantiatedWorkbench: IWorkbench | undefined = undefined;
  main(domElement).then(workbench => {
    instantiatedWorkbench = workbench;
  });

  return toDisposable(() => {
    if (instantiatedWorkbench) {
      instantiatedWorkbench.shutdown();
    } else {
      workbenchPromise.then(instantiatedWorkbench => instantiatedWorkbench.shutdown());
    }
  });
}

create(document.body);



