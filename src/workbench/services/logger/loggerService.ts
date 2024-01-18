import { registerSharedProcessRemoteService } from 'platform/ipc/electron-sandbox/services';
import { ILoggerService } from 'src/platform/logger/common/logger';

registerSharedProcessRemoteService(ILoggerService, 'logger', { supportsDelayedInstantiation: true });
