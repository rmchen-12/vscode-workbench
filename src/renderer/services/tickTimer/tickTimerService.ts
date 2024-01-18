import { registerMainAppRemoteService } from 'platform/ipc/electron-sandbox/services';
import { ITickTimerService } from 'src/platform/tickTimer/common/tickTimer';

export const registerTickTimerService = () => registerMainAppRemoteService(ITickTimerService, 'tickTimer', { supportsDelayedInstantiation: true });
