import { createDecorator } from 'platform/instantiation/instantiation';
import { ICommonAuthenticationService } from '../common/authentication';

export const IAuthenticationService = createDecorator<IAuthenticationService>('authenticationService');

export interface IAuthenticationService {
  login(arg: number): Promise<number>;
  getList(): Promise<any>;
}
