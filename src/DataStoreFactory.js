import { AccountActivationStore } from "./stores/AccountActivationStore";
import {RecentJournalStore} from "./stores/RecentJournalStore";
//
// this class is used to manage DataClient requests for Stores
//
export class DataStoreFactory {
  static createStore(name, scope) {
    switch (name) {
      case DataStoreFactory.Stores.ACCOUNT_ACTIVATION:
        return new AccountActivationStore(scope);
      case DataStoreFactory.Stores.RECENT_JOURNAL:
        return new RecentJournalStore(scope);
      default:
        return null;
    }
  }

  static get Stores() {
    return {
      ACCOUNT_ACTIVATION: "account-activation",
      RECENT_JOURNAL: "recent-journal"
    };
  }
}
