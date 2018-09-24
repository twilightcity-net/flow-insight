import { AccountActivationStore } from "./stores/AccountActivationStore";
import {RecentJournalStore} from "./stores/RecentJournalStore";
import {JournalEntryStore} from "./stores/JournalEntryStore";
import {RecentTasksStore} from "./stores/RecentTasksStore";
import {CreateTaskStore} from "./stores/CreateTaskStore";

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
      case DataStoreFactory.Stores.JOURNAL_ENTRY:
        return new JournalEntryStore(scope);
      case DataStoreFactory.Stores.RECENT_TASKS:
        return new RecentTasksStore(scope);

      case DataStoreFactory.Stores.CREATE_TASK:
        return new CreateTaskStore(scope);
      default:
        return null;
    }
  }

  static get Stores() {
    return {
      ACCOUNT_ACTIVATION: "account-activation",
      RECENT_JOURNAL: "recent-journal",
      RECENT_TASKS: "recent-tasks",
      JOURNAL_ENTRY: "journal-entry",
      TASK_DETAILS: "task-details"

    };
  }
}
