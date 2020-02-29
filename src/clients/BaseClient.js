import UtilRenderer from "../UtilRenderer";
import { RendererClientEvent } from "../events/RendererClientEvent";

export class BaseClient {
  static instance;

  static get Strings() {
    return {
      ME: "me",
      PRIMARY: "primary",
      EMPTY: "",
      YOU: " (you)",
      LOADING: "loading...",
      ONLINE: "online",
      OFFLINE: "offline"
    };
  }

  static get Errors() {
    return {
      UNKNOWN: "Unknown team panel menu item"
    };
  }

  constructor(scope, name) {
    this.name = "[" + name + "]";
    this.scope = scope;
    this.guid = UtilRenderer.getGuid();
  }

  delegateCallback(event, arg, callback) {
    if (callback) {
      callback(arg);
    }
  }

  createClientEvent(type, args, scope, callback) {
    return new RendererClientEvent(type, args, scope, (event, arg) =>
      this.delegateCallback(event, arg, callback)
    );
  }

  logReply(name, size, id, type) {
    console.log("[" + name + "] reply {" + size + "} : " + id + " -> " + type);
  }
}
