import { registerSingleton } from "src/platform/instantiation/extensions";
import { IWorkbenchLayoutService, Parts } from "src/workbench/services/layout/layoutService";
import { IPanelService } from "src/workbench/services/panel/common/panelService";
import { Part } from "src/workbench/browser/part";
import { Color } from "src/base/common/color";

export class PanelPart extends Part implements IPanelService {

  declare readonly _serviceBrand: undefined;

  //#region IView

  readonly minimumWidth: number = 300;
  readonly maximumWidth: number = Number.POSITIVE_INFINITY;
  readonly minimumHeight: number = 77;
  readonly maximumHeight: number = Number.POSITIVE_INFINITY;

  //#region

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.PANEL_PART, {}, layoutService);
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    this.element = parent;
    this.element.style.backgroundColor = Color.green.toString();

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.PANEL_PART
    };
  }
}

registerSingleton(IPanelService, PanelPart);
