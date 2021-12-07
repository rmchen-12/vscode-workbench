import { Disposable } from "src/base/common/lifecycle";

export class Component extends Disposable {
  constructor(private readonly id: string) {
    super();
    this.id = id;
  }

  getId(): string {
    return this.id;
  }
}
