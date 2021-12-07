import { registerSingleton } from "src/platform/instantiation/extensions";
import { IStatusbarService } from "src/workbench/services/statusbar/common/statusbarService";
import { Part } from "src/workbench/browser/part";
import { IWorkbenchLayoutService, Parts } from "src/workbench/services/layout/layoutService";
import { Color } from "src/base/common/color";

export class StatusbarPart extends Part implements IStatusbarService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 0;
  readonly maximumWidth: number = Number.POSITIVE_INFINITY;
  readonly minimumHeight: number = 22;
  readonly maximumHeight: number = 22;

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.STATUSBAR_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.red.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.STATUSBAR_PART
    };
  }
}

registerSingleton(IStatusbarService, StatusbarPart);
