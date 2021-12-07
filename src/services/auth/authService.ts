import { createDecorator } from "../../platform/instantiation/instantiation";

export const IAuthService = createDecorator<IAuthService>('authService');

export interface IAuthService {
  // service的标识符，有这个属性说明是一个service
  readonly _serviceBrand: undefined;
  getUserInfo(): void;
}
