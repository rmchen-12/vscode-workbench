import { Event } from 'src/base/common/event';
import { createDecorator } from "src/platform/instantiation/instantiation";
import { ILayoutService } from "src/platform/layout/layoutService";
import { Part } from 'src/workbench/browser/part';

export const IWorkbenchLayoutService = createDecorator<IWorkbenchLayoutService>('layoutService');

export const enum Parts {
  TITLEBAR_PART = 'workbench.parts.titlebar',
  ACTIVITYBAR_PART = 'workbench.parts.activitybar',
  SIDEBAR_PART = 'workbench.parts.sidebar',
  PANEL_PART = 'workbench.parts.panel',
  EDITOR_PART = 'workbench.parts.editor',
  STATUSBAR_PART = 'workbench.parts.statusbar'
}

export const enum Position {
  LEFT,
  RIGHT,
  BOTTOM
}

const positionsByString: { [key: string]: Position; } = {
  [positionToString(Position.LEFT)]: Position.LEFT,
  [positionToString(Position.RIGHT)]: Position.RIGHT,
  [positionToString(Position.BOTTOM)]: Position.BOTTOM
};

export function positionFromString(str: string): Position {
  return positionsByString[str];
}

export function positionToString(position: Position): string {
  switch (position) {
    case Position.LEFT: return 'left';
    case Position.RIGHT: return 'right';
    case Position.BOTTOM: return 'bottom';
    default: return 'bottom';
  }
}

export interface IWorkbenchLayoutService extends ILayoutService {

  readonly _serviceBrand: undefined;

  /**
   * Emits when fullscreen is enabled or disabled.
   */
  readonly onFullscreenChange: Event<boolean>;

  /**
   * Emits when the window is maximized or unmaximized.
   */
  readonly onMaximizeChange: Event<boolean>;

  /**
   * Run a layout of the workbench.
   */
  layout(): void;

  /**
   * Register a part to participate in the layout.
   */
  registerPart(part: Part): void;

  /**
   * Returns the parts HTML element, if there is one.
   */
  getContainer(part: Parts): HTMLElement | undefined;

  /**
   * Returns the element that is parent of the workbench element.
   */
  getWorkbenchContainer(): HTMLElement;

  /**
   * Register a part to participate in the layout.
   */
  registerPart(part: Part): void;
}
