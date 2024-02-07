export { app } from '@hi/bridge-core';
import { services as coreServices } from '@hi/bridge-core';
import { IAuthenticationService } from './services/authentication/index';
import { ITickTimerService } from './services/tickTimer/index';

interface IServices {
  authentication: IAuthenticationService;
  tickTimer: ITickTimerService;
}

export const services = coreServices as IServices;
