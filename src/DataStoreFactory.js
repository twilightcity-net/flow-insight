import { AccountActivationStore } from "./stores/AccountActivationStore";
import {RecentJournalStore} from "./stores/RecentJournalStore";
import {NewJournalEntryStore} from "./stores/NewJournalEntryStore";
import {RecentTasksStore} from "./stores/RecentTasksStore";
import {NewTaskStore} from "./stores/NewTaskStore";

//
// this class is used to manage DataClient requests for Stores
//
export class DataStoreFactory {
  static createStore(name, scope) {
    switch (name) {
      case DataStoreFactory.Stores.ACCOUNT_ACTIVATION:
        return new AccountActivationStore(scope);
      case DataStoreFactory.Stores.NEW_JOURNAL_ENTRY:
        return new NewJournalEntryStore(scope);
      case DataStoreFactory.Stores.RECENT_JOURNAL:
        return new RecentJournalStore(scope);
      case DataStoreFactory.Stores.RECENT_TASKS:
        return new RecentTasksStore(scope);
      case DataStoreFactory.Stores.NEW_TASK:
        return new NewTaskStore(scope);
      default:
        return null;
    }
  }

  static get Stores() {
    return {
      ACCOUNT_ACTIVATION: "account-activation",
      RECENT_JOURNAL: "recent-journal",
      RECENT_TASKS: "recent-tasks",
      NEW_JOURNAL_ENTRY: "new-journal-entry",
      NEW_TASK: "new-task"
    };
  }
}
