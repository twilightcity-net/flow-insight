import { AccountActivationStore } from "./AccountActivationStore";

/**
 * this class is used to manage DtoClient requests for Stores
 */
export class DataStoreFactory {
  static storesByName = {};

  static createStore(name, scope) {
    return DataStoreFactory.findOrCreateStore(name, scope);
  }

  static findOrCreateStore(name, scope) {
    let storeFound = null;

    if (DataStoreFactory.storesByName[name] != null) {
      storeFound = DataStoreFactory.storesByName[name];
    } else {
      storeFound = DataStoreFactory.initializeNewStore(
        name,
        scope
      );
      DataStoreFactory.storesByName[name] = storeFound;
    }

    return storeFound;
  }

  static initializeNewStore(name, scope) {
    if (
      name === DataStoreFactory.Stores.ACCOUNT_ACTIVATION
    ) {
      return new AccountActivationStore(scope);
    } else {
      return null;
    }
  }

  static get Stores() {
    return {
      ACCOUNT_ACTIVATION: "account-activation",
    };
  }
}
