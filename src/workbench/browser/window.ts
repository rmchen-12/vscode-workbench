/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { setFullscreen } from 'src/base/browser/browser';
import { addDisposableListener, addDisposableThrottledListener, detectFullscreen, EventHelper, EventType } from 'src/base/browser/dom';
import { Disposable } from 'src/base/common/lifecycle';
import { isIOS, isMacintosh } from 'src/base/common/platform';
import { IWorkbenchLayoutService } from 'src/workbench/services/layout/layoutService';

export class BrowserWindow extends Disposable {

  constructor(
    @IWorkbenchLayoutService private readonly layoutService: IWorkbenchLayoutService
  ) {
    super();

    this.registerListeners();
  }

  private registerListeners(): void {

    // Layout
    const viewport = isIOS && window.visualViewport ? window.visualViewport /** Visual viewport */ : window /** Layout viewport */;
    this._register(addDisposableListener(viewport, EventType.RESIZE, () => this.onWindowResize()));

    // Prevent the back/forward gestures in macOS
    this._register(addDisposableListener(this.layoutService.getWorkbenchContainer(), EventType.WHEEL, e => e.preventDefault(), { passive: false }));

    // Prevent native context menus in web
    this._register(addDisposableListener(this.layoutService.getWorkbenchContainer(), EventType.CONTEXT_MENU, e => EventHelper.stop(e, true)));

    // Prevent default navigation on drop
    this._register(addDisposableListener(this.layoutService.getWorkbenchContainer(), EventType.DROP, e => EventHelper.stop(e, true)));

    // Fullscreen (Browser)
    [EventType.FULLSCREEN_CHANGE, EventType.WK_FULLSCREEN_CHANGE].forEach(event => {
      this._register(addDisposableListener(document, event, () => setFullscreen(!!detectFullscreen())));
    });

    // Fullscreen (Native)
    this._register(addDisposableThrottledListener(viewport, EventType.RESIZE, () => {
      setFullscreen(!!detectFullscreen());
    }, undefined, isMacintosh ? 2000 /* adjust for macOS animation */ : 800 /* can be throttled */));
  }

  private onWindowResize(): void {
    this.layoutService.layout();
  }

}
