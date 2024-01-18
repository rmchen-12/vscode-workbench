import { registerSharedProcessRemoteService } from 'platform/ipc/electron-sandbox/services';
import { ILoggerService } from 'src/platform/logger/common/logger';

export const registerLoggerService = () => registerSharedProcessRemoteService(ILoggerService, 'logger', { supportsDelayedInstantiation: true });
