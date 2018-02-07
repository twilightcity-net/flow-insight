import { AccountActivationStore } from "./stores/AccountActivationStore";
//
// this class is used to manage DataClient requests for Stores
//
export class DataStoreFactory {
  static createStore(name, scope) {
    switch (name) {
      case DataStoreFactory.Stores.ACCOUNT_ACTIVATION:
        return new AccountActivationStore(scope);
      default:
        return null;
    }
  }

  static get Stores() {
    return {
      ACCOUNT_ACTIVATION: "account-activation"
    };
  }
}
