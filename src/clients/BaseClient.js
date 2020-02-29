import UtilRenderer from "../UtilRenderer";

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
}
