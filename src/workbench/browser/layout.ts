import { Dimension, getClientArea, IDimension, position, size } from "src/base/browser/dom";
import { Emitter } from "src/base/common/event";
import { Disposable } from "src/base/common/lifecycle";
import { ServicesAccessor } from "src/platform/instantiation/instantiation";
import { IWorkbenchLayoutService, Parts, Position, } from "src/workbench/services/layout/layoutService";
import { Part } from "src/workbench/browser/part";
import { ISerializableView, ISerializedGrid, ISerializedLeafNode, ISerializedNode, Orientation, SerializableGrid } from "src/base/browser/ui/grid/grid";
import { IEditorService } from "src/workbench/services/editor/common/editorService";
import { IPanelService } from "src/workbench/services/panel/common/panelService";
import { ITitleService } from "src/workbench/services/title/common/titleService";
import { IActivityBarService } from "src/workbench/services/activityBar/common/activityBarService";
import { IStatusbarService } from "src/workbench/services/statusbar/common/statusbarService";
import { ISidebarService } from "src/workbench/services/sidebar/browser/sidebarService";

export abstract class Layout extends Disposable implements IWorkbenchLayoutService {

  declare readonly _serviceBrand: undefined;

  //#region Events

  private readonly _onFullscreenChange = this._register(new Emitter<boolean>());
  readonly onFullscreenChange = this._onFullscreenChange.event;

  private readonly _onMaximizeChange = this._register(new Emitter<boolean>());
  readonly onMaximizeChange = this._onMaximizeChange.event;

  private readonly _onLayout = this._register(new Emitter<IDimension>());
  readonly onLayout = this._onLayout.event;

  //#endregion

  readonly container: HTMLElement = document.createElement('div');

  private _dimension!: IDimension;
  get dimension(): IDimension { return this._dimension; }


  private readonly parts = new Map<string, Part>();

  private workbenchGrid!: SerializableGrid<ISerializableView>;

  private disposed: boolean | undefined;

  private titleBarPartView!: ISerializableView;
  private activityBarPartView!: ISerializableView;
  private sideBarPartView!: ISerializableView;
  private panelPartView!: ISerializableView;
  private editorPartView!: ISerializableView;
  private statusBarPartView!: ISerializableView;

  private editorService!: IEditorService;
  private activityBarService!: IActivityBarService;
  private panelService!: IPanelService;
  private titleService!: ITitleService;
  private statusBarService!: IStatusbarService;
  private sidebarService!: ISidebarService;

  protected readonly state = {
    fullscreen: false,
    maximized: false,
    hasFocus: false,
    windowBorder: false,

    activityBar: {
      hidden: false
    },

    sideBar: {
      hidden: false,
      position: Position.LEFT,
      width: 300,
      viewletToRestore: undefined as string | undefined
    },

    editor: {
      hidden: false,
      centered: false,
      restoreCentered: false,
      restoreEditors: false,
    },

    panel: {
      hidden: false,
      position: Position.BOTTOM,
      lastNonMaximizedWidth: 300,
      lastNonMaximizedHeight: 300,
      wasLastMaximized: false,
      panelToRestore: undefined as string | undefined
    },

    statusBar: {
      hidden: false
    },

    views: {
      defaults: undefined as (string[] | undefined)
    },
  };

  constructor(
    protected readonly parent: HTMLElement
  ) {
    super();
  }

  protected initLayout(accessor: ServicesAccessor): void {

    // Services
    // this.environmentService = accessor.get(IWorkbenchEnvironmentService);
    // this.configurationService = accessor.get(IConfigurationService);
    // this.lifecycleService = accessor.get(ILifecycleService);
    // this.hostService = accessor.get(IHostService);
    // this.contextService = accessor.get(IWorkspaceContextService);
    // this.storageService = accessor.get(IStorageService);
    // this.backupFileService = accessor.get(IBackupFileService);
    // this.themeService = accessor.get(IThemeService);
    // this.extensionService = accessor.get(IExtensionService);
    // this.logService = accessor.get(ILogService);

    // // Parts
    this.editorService = accessor.get(IEditorService);
    this.panelService = accessor.get(IPanelService);
    this.titleService = accessor.get(ITitleService);
    this.activityBarService = accessor.get(IActivityBarService);
    this.statusBarService = accessor.get(IStatusbarService);
    this.sidebarService = accessor.get(ISidebarService);

    // Listeners
    this.registerLayoutListeners();

    // State
    this.initLayoutState();
  }

  private registerLayoutListeners(): void { }

  private initLayoutState(): void { }

  protected createWorkbenchLayout(): void {
    const titleBar = this.getPart(Parts.TITLEBAR_PART);
    const editorPart = this.getPart(Parts.EDITOR_PART);
    const activityBar = this.getPart(Parts.ACTIVITYBAR_PART);
    const panelPart = this.getPart(Parts.PANEL_PART);
    const sideBar = this.getPart(Parts.SIDEBAR_PART);
    const statusBar = this.getPart(Parts.STATUSBAR_PART);

    // View references for all parts
    this.titleBarPartView = titleBar;
    this.sideBarPartView = sideBar;
    this.activityBarPartView = activityBar;
    this.editorPartView = editorPart;
    this.panelPartView = panelPart;
    this.statusBarPartView = statusBar;

    const viewMap = {
      [Parts.ACTIVITYBAR_PART]: this.activityBarPartView,
      [Parts.TITLEBAR_PART]: this.titleBarPartView,
      [Parts.EDITOR_PART]: this.editorPartView,
      [Parts.PANEL_PART]: this.panelPartView,
      [Parts.SIDEBAR_PART]: this.sideBarPartView,
      [Parts.STATUSBAR_PART]: this.statusBarPartView
    };

    const fromJSON = ({ type }: { type: Parts; }) => viewMap[type];

    const workbenchGrid = SerializableGrid.deserialize(
      this.createGridDescriptor(),
      { fromJSON },
      { proportionalLayout: false }
    );

    this.container.prepend(workbenchGrid.element);
    this.container.setAttribute('role', 'application');
    this.workbenchGrid = workbenchGrid;
    this.workbenchGrid.edgeSnapping = this.state.fullscreen;
  }

  layout(): void {
    if (!this.disposed) {
      this._dimension = this.getClientArea();

      position(this.container, 0, 0, 0, 0, 'relative');
      size(this.container, this._dimension.width, this._dimension.height);

      // Layout the grid widget
      this.workbenchGrid.layout(this._dimension.width, this._dimension.height);

      // Emit as event
      this._onLayout.fire(this._dimension);
    }
  }

  private createGridDescriptor(): ISerializedGrid {
    const workbenchDimensions = this.getClientArea();
    const width = workbenchDimensions.width;
    const height = workbenchDimensions.height;
    const sideBarSize = Math.min(workbenchDimensions.width / 4, 300);
    const fallbackPanelSize = this.state.panel.position === Position.BOTTOM ? workbenchDimensions.height / 3 : workbenchDimensions.width / 4;
    const panelSize = fallbackPanelSize;

    const titleBarHeight = this.titleBarPartView.minimumHeight;
    const statusBarHeight = this.statusBarPartView.minimumHeight;
    const activityBarWidth = this.activityBarPartView.minimumWidth;
    const middleSectionHeight = height - titleBarHeight - statusBarHeight;
    const editorSectionWidth = width - (this.state.activityBar.hidden ? 0 : activityBarWidth) - (this.state.sideBar.hidden ? 0 : sideBarSize);

    const activityBarNode: ISerializedLeafNode = {
      type: 'leaf',
      data: { type: Parts.ACTIVITYBAR_PART },
      size: activityBarWidth,
      visible: !this.state.activityBar.hidden
    };

    const sideBarNode: ISerializedLeafNode = {
      type: 'leaf',
      data: { type: Parts.SIDEBAR_PART },
      size: sideBarSize,
      visible: !this.state.sideBar.hidden
    };

    const editorNode: ISerializedLeafNode = {
      type: 'leaf',
      data: { type: Parts.EDITOR_PART },
      size: this.state.panel.position === Position.BOTTOM ?
        middleSectionHeight - (this.state.panel.hidden ? 0 : panelSize) :
        editorSectionWidth - (this.state.panel.hidden ? 0 : panelSize),
      visible: !this.state.editor.hidden
    };

    const panelNode: ISerializedLeafNode = {
      type: 'leaf',
      data: { type: Parts.PANEL_PART },
      size: panelSize,
      visible: !this.state.panel.hidden
    };

    const editorSectionNode = this.arrangeEditorNodes(editorNode, panelNode, editorSectionWidth);

    const middleSection: ISerializedNode[] = this.state.sideBar.position === Position.LEFT
      ? [activityBarNode, sideBarNode, ...editorSectionNode]
      : [...editorSectionNode, sideBarNode, activityBarNode];

    const result: ISerializedGrid = {
      root: {
        type: 'branch',
        size: width,
        data: [
          {
            type: 'leaf',
            data: { type: Parts.TITLEBAR_PART },
            size: titleBarHeight,
            visible: this.isVisible(Parts.TITLEBAR_PART)
          },
          {
            type: 'branch',
            data: middleSection,
            size: middleSectionHeight
          },
          {
            type: 'leaf',
            data: { type: Parts.STATUSBAR_PART },
            size: statusBarHeight,
            visible: !this.state.statusBar.hidden
          }
        ]
      },
      orientation: Orientation.VERTICAL,
      width,
      height
    };

    return result;
  }

  isVisible(part: Parts): boolean {
    switch (part) {
      default:
        return true; // any other part cannot be hidden
    }
  }

  getClientArea(): Dimension {
    return getClientArea(this.parent);
  }

  private arrangeEditorNodes(editorNode: ISerializedNode, panelNode: ISerializedNode, editorSectionWidth: number): ISerializedNode[] {
    switch (this.state.panel.position) {
      case Position.BOTTOM:
        return [{ type: 'branch', data: [editorNode, panelNode], size: editorSectionWidth }];
      case Position.RIGHT:
        return [editorNode, panelNode];
      case Position.LEFT:
        return [panelNode, editorNode];
    }
  }

  registerPart(part: Part): void {
    this.parts.set(part.getId(), part);
  }

  protected getPart(key: Parts): Part {
    const part = this.parts.get(key);
    if (!part) {
      throw new Error(`Unknown part ${key}`);
    }

    return part;
  }

  getContainer(part: Parts): HTMLElement | undefined {
    switch (part) {
      case Parts.TITLEBAR_PART:
        return this.getPart(Parts.TITLEBAR_PART).getContainer();
      case Parts.ACTIVITYBAR_PART:
        return this.getPart(Parts.ACTIVITYBAR_PART).getContainer();
      case Parts.SIDEBAR_PART:
        return this.getPart(Parts.SIDEBAR_PART).getContainer();
      case Parts.PANEL_PART:
        return this.getPart(Parts.PANEL_PART).getContainer();
      case Parts.EDITOR_PART:
        return this.getPart(Parts.EDITOR_PART).getContainer();
      case Parts.STATUSBAR_PART:
        return this.getPart(Parts.STATUSBAR_PART).getContainer();
    }
  }

  getWorkbenchContainer(): HTMLElement {
    return this.parent;
  }

}
