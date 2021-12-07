import { registerSingleton } from "src/platform/instantiation/extensions";
import { IWorkbenchLayoutService, Parts } from "src/workbench/services/layout/layoutService";
import { ITitleService } from "src/workbench/services/title/common/titleService";
import { Part } from "src/workbench/browser/part";
import { Color } from "src/base/common/color";

export class TitlebarPart extends Part implements ITitleService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 0;
  readonly maximumWidth: number = Number.POSITIVE_INFINITY;
  get minimumHeight(): number { return 30; }
  get maximumHeight(): number { return this.minimumHeight; }

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.TITLEBAR_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.lightgrey.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.TITLEBAR_PART
    };
  }
}

registerSingleton(ITitleService, TitlebarPart);
