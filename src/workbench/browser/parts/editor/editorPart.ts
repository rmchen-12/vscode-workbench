import { registerSingleton } from "src/platform/instantiation/extensions";
import { IEditorService } from "src/workbench/services/editor/common/editorService";
import { IWorkbenchLayoutService, Parts } from "src/workbench/services/layout/layoutService";
import { Part } from "src/workbench/browser/part";
import { Color } from "src/base/common/color";
import { Grid, IView } from "src/base/browser/ui/grid/grid";
import { Relay, Event } from "src/base/common/event";
import { CenteredViewLayout } from "src/base/browser/ui/centered/centeredViewLayout";
import { IEditorGroupView } from "src/workbench/browser/parts/editor/editor";
import { $ } from 'src/base/browser/dom';

class GridWidgetView<T extends IView> implements IView {

  readonly element: HTMLElement = $('.grid-view-container');

  get minimumWidth(): number { return this.gridWidget ? this.gridWidget.minimumWidth : 0; }
  get maximumWidth(): number { return this.gridWidget ? this.gridWidget.maximumWidth : Number.POSITIVE_INFINITY; }
  get minimumHeight(): number { return this.gridWidget ? this.gridWidget.minimumHeight : 0; }
  get maximumHeight(): number { return this.gridWidget ? this.gridWidget.maximumHeight : Number.POSITIVE_INFINITY; }

  private _onDidChange = new Relay<{ width: number; height: number; } | undefined>();
  readonly onDidChange = this._onDidChange.event;

  private _gridWidget: Grid<T> | undefined;

  get gridWidget(): Grid<T> | undefined {
    return this._gridWidget;
  }

  set gridWidget(grid: Grid<T> | undefined) {
    this.element.innerText = '';

    if (grid) {
      this.element.appendChild(grid.element);
      this._onDidChange.input = grid.onDidChange;
    } else {
      this._onDidChange.input = Event.None;
    }

    this._gridWidget = grid;
  }

  layout(width: number, height: number): void {
    if (this.gridWidget) {
      this.gridWidget.layout(width, height);
    }
  }

  dispose(): void {
    this._onDidChange.dispose();
  }
}

export class EditorPart extends Part implements IEditorService {

  declare readonly _serviceBrand: undefined;

  private container: HTMLElement | undefined;

  private gridWidgetView: GridWidgetView<IEditorGroupView>;
  private centeredLayoutWidget!: CenteredViewLayout;

  //#region IView

  get minimumWidth(): number { return this.centeredLayoutWidget.minimumWidth; }
  get maximumWidth(): number { return this.centeredLayoutWidget.maximumWidth; }
  get minimumHeight(): number { return this.centeredLayoutWidget.minimumHeight; }
  get maximumHeight(): number { return this.centeredLayoutWidget.maximumHeight; }

  //#endregion

  constructor(@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService) {
    super(Parts.EDITOR_PART, {}, layoutService);

    this.gridWidgetView = new GridWidgetView<IEditorGroupView>();
  }

  createContentArea(parent: HTMLElement): HTMLElement {
    // Container
    this.element = parent;
    this.container = document.createElement('div');
    this.container.classList.add('content');
    parent.appendChild(this.container);

    this.element.style.backgroundColor = Color.black.toString();

    this.centeredLayoutWidget = this._register(new CenteredViewLayout(this.container, this.gridWidgetView,));

    return this.element;
  }

  layout(width: number, height: number): void {
    super.layoutContents(width, height);
  }

  toJSON(): object {
    return {
      type: Parts.EDITOR_PART
    };
  }
}

registerSingleton(IEditorService, EditorPart);
