import { registerMainProcessRemoteService } from 'platform/ipc/electron-sandbox/services';
import { IAuthenticationService } from 'platform/authentication/electron-sandbox/authentication';

export const registerAuthenticationService = () => registerMainProcessRemoteService(IAuthenticationService, 'authentication', { supportsDelayedInstantiation: true });
