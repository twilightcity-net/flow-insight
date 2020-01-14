import UtilRenderer from "../UtilRenderer";

/**
 * a child event that contains the circuit event callback.
 */
export class RendererClientEvent {
  /**
   * builds the client event for the main process
   * @param type
   * @param args
   * @param scope
   * @param callback
   */
  constructor(type, args, scope, callback) {
    this.id = UtilRenderer.getGuid();
    this.type = type;
    this.args = args;
    this.callback = callback ? callback.bind(scope) : callback;
  }
}
