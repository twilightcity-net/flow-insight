import { AccountActivationStore } from "./stores/AccountActivationStore";

/**
 * this class is used to manage DataClient requests for Stores
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
      storeFound = DataStoreFactory.initializeNewStore(name, scope);
      DataStoreFactory.storesByName[name] = storeFound;
    }

    return storeFound;
  }

  static initializeNewStore(name, scope) {
    if (name === DataStoreFactory.Stores.ACCOUNT_ACTIVATION) {
      return new AccountActivationStore(scope);
    } else {
      return null;
    }
  }

  static get Stores() {
    return {
      ACCOUNT_ACTIVATION: "account-activation",
      RECENT_JOURNAL: "recent-journal",
      RECENT_TASKS: "recent-tasks",
      NEW_JOURNAL_ENTRY: "new-journal-entry",
      NEW_TASK: "new-task",
      XP_SUMMARY: "xp-summary",
      UPDATED_FLAME: "updated-flame",
      TEAM_WITH_MEMBERS: "team-with-members",
      NEW_CIRCLE: "new-circle",
      CLOSE_CIRCLE: "close-circle",
      RESOLVE_ABORT: "resolve-abort",
      UPDATED_FINISH: "updated-finish"
    };
  }
}
