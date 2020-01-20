import UtilRenderer from "../UtilRenderer";

export class BaseClient {
  static instance;

  constructor(scope, name) {
    this.name = "[" + name + "]";
    this.scope = scope;
    this.guid = UtilRenderer.getGuid();
  }
}
