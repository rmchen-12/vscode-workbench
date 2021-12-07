/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ShutdownReason, ILifecycleService } from 'src/workbench/services/lifecycle/common/lifecycle';
import { AbstractLifecycleService } from 'src/workbench/services/lifecycle/common/lifecycleService';
import { registerSingleton } from 'src/platform/instantiation/extensions';
import { IDisposable } from 'src/base/common/lifecycle';
import { addDisposableListener } from 'src/base/browser/dom';

export class BrowserLifecycleService extends AbstractLifecycleService {

  declare readonly _serviceBrand: undefined;

  private beforeUnloadDisposable: IDisposable | undefined = undefined;
  private expectedUnload = false;

  constructor() {
    super();

    this.registerListeners();
  }

  private registerListeners(): void {

    // beforeUnload
    this.beforeUnloadDisposable = addDisposableListener(window, 'beforeunload', (e: BeforeUnloadEvent) => this.onBeforeUnload(e));
  }

  private onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.expectedUnload) {

      this.expectedUnload = false;

      return; // ignore expected unload only once
    }

    this.doShutdown(() => {

      // Veto handling
      event.preventDefault();
      event.returnValue = "Changes that you made may not be saved. Please check press 'Cancel' and try again.";
    });
  }

  withExpectedUnload(callback: Function): void {
    this.expectedUnload = true;
    try {
      callback();
    } finally {
      this.expectedUnload = false;
    }
  }

  shutdown(): void {

    // Remove `beforeunload` listener that would prevent shutdown
    this.beforeUnloadDisposable?.dispose();

    // Handle shutdown without veto support
    this.doShutdown();
  }

  private doShutdown(handleVeto?: () => void): void {

    let veto = false;

    // Before Shutdown
    this._onBeforeShutdown.fire({
      veto(value) {
        if (typeof handleVeto === 'function') {
          if (value instanceof Promise) {

            value = true; // implicitly vetos since we cannot handle promises in web
          }

          if (value === true) {

            veto = true;
          }
        }
      },
      reason: ShutdownReason.QUIT
    });

    // Veto: handle if provided
    if (veto && typeof handleVeto === 'function') {
      handleVeto();

      return;
    }

    // No Veto: continue with Will Shutdown
    this._onWillShutdown.fire({
      join() { },
      reason: ShutdownReason.QUIT
    });

    // Finally end with Shutdown event
    this._onShutdown.fire();
  }
}

registerSingleton(ILifecycleService, BrowserLifecycleService);
