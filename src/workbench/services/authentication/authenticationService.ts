import { registerMainProcessRemoteService } from 'platform/ipc/electron-sandbox/services';
import { IAuthenticationService } from 'platform/authentication/electron-sandbox/authentication';

registerMainProcessRemoteService(IAuthenticationService, 'authentication', { supportsDelayedInstantiation: true });
