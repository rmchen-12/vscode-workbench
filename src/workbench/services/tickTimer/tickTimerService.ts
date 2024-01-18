import { registerMainAppRemoteService } from 'platform/ipc/electron-sandbox/services';
import { ITickTimerService } from 'src/platform/tickTimer/common/tickTimer';

registerMainAppRemoteService(ITickTimerService, 'tickTimer', { supportsDelayedInstantiation: true });
