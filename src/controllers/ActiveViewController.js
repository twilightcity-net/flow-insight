import UtilRenderer from "../UtilRenderer";

export class ActiveViewController {
  constructor(scope) {
    this.name = "[" + this.constructor.name + "]";
    this.scope = scope;
    this.guid = UtilRenderer.getGuid();
  }
}
