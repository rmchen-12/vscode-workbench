import { ISerializableView } from "src/base/browser/ui/grid/grid";
import { IDisposable } from "src/base/common/lifecycle";

export interface IEditorGroupView extends IDisposable, ISerializableView {

  readonly isEmpty: boolean;
  readonly isMinimized: boolean;

  readonly disposed: boolean;

  setActive(isActive: boolean): void;

  relayout(): void;
}
