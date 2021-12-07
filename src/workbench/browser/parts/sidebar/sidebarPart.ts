import { registerSingleton } from "src/platform/instantiation/extensions";
import { IWorkbenchLayoutService, Parts } from "src/workbench/services/layout/layoutService";
import { Part } from "src/workbench/browser/part";
import { ISidebarService } from "src/workbench/services/sidebar/browser/sidebarService";
import { Color } from "src/base/common/color";

export class SidebarPart extends Part implements ISidebarService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 170;
  readonly maximumWidth: number = Number.POSITIVE_INFINITY;
  readonly minimumHeight: number = 0;
  readonly maximumHeight: number = Number.POSITIVE_INFINITY;

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.SIDEBAR_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.cyan.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.SIDEBAR_PART
    };
  }
}

registerSingleton(ISidebarService, SidebarPart);
