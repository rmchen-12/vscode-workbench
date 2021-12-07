import { registerSingleton } from "src/platform/instantiation/extensions";
import { IActivityBarService } from "src/workbench/services/activityBar/common/activityBarService";
import { Part } from "src/workbench/browser/part";
import { IWorkbenchLayoutService, Parts } from "src/workbench/services/layout/layoutService";
import { Color } from 'src/base/common/color';

export class ActivitybarPart extends Part implements IActivityBarService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 48;
  readonly maximumWidth: number = 48;
  readonly minimumHeight: number = 0;
  readonly maximumHeight: number = Number.POSITIVE_INFINITY;

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.ACTIVITYBAR_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.blue.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.ACTIVITYBAR_PART
    };
  }
}

registerSingleton(IActivityBarService, ActivitybarPart);
