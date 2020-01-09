import { BaseClient } from "./BaseClient";

export class CircuitClient extends BaseClient {
  constructor(scope) {
    super(scope, CircuitClient.constructor.name);
  }

  static instance;

  static init(scope) {
    if (!CircuitClient.instance) {
      CircuitClient.instance = new CircuitClient(scope);
    }
  }
}
