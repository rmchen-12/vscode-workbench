import { createDecorator } from '../../platform/instantiation/instantiation';

export const IAppService = createDecorator<IAppService>('appService');

export interface IAppService {
  // service的标识符，有这个属性说明是一个service
  readonly _serviceBrand: undefined;
//   getUserInfo(): void;
}
