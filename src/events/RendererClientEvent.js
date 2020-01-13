import UtilRenderer from "../UtilRenderer";

export class RendererClientEvent {
  constructor(type, arg, id) {
    this.type = type;
    this.arg = arg;
    this.id = UtilRenderer.getGuid();
  }
}
