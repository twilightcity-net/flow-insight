import UtilRenderer from "../UtilRenderer";

/**
 * a child event that contains the circuit event callback.
 */
export class RendererClientEvent {
  /**
   * builds the client event for the main process
   * @param type
   * @param arg
   * @param scope
   * @param callback
   */
  constructor(type, arg, scope, callback) {
    this.id = UtilRenderer.getGuid();
    this.type = type;
    this.arg = arg;
    this.callback = callback ? callback.bind(scope) : callback;
  }
}
