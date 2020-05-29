const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class is used to build new databases
 * @type {JournalDatabase}
 */
module.exports = class JournalDatabase extends LokiJS {
  /**
   * this is our name of our database in memory and file
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "journal";
  }

  /**
   * our collection in our database
   * @returns {{INTENTIONS: string, TASKS: string, PROJECTS: string}}
   * @constructor
   */
  static get Collections() {
    return {
      INTENTIONS: "intentions",
      PROJECTS: "projects",
      TASKS: "tasks"
    };
  }

  /**
   * our databases dynamic views using indices
   * @returns {{INTENTIONS: string, TASKS: string, PROJECTS: string}}
   * @constructor
   */
  static get Views() {
    return {
      INTENTIONS: "intentions",
      PROJECTS: "projects",
      TASKS: "tasks"
    };
  }

  /**
   * the indices we wish to store for what we query on (faster)
   * @returns {{POSITION: string, DESCRIPTION: string, JOURNAL_ENTRY_TYPE: string, TIMESTAMP: string, MEMBER_ID: string, USER_NAME: string, ID: string, TASK_ID: string, PROJECT_ID: string}}
   * @constructor
   */
  static get Indices() {
    return {
      USER_NAME: "username",
      MEMBER_ID: "memberId",
      ID: "id",
      TASK_ID: "taskId",
      PROJECT_ID: "projectId",
      DESCRIPTION: "description",
      JOURNAL_ENTRY_TYPE: "journalEntryType",
      POSITION: "position",
      TIMESTAMP: "timestamp"
    };
  }

  /**
   * builds our journal database
   */
  constructor() {
    super(JournalDatabase.Name);
    this.name = "[JournalDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(
      JournalDatabase.Collections.INTENTIONS,
      {
        indices: [
          JournalDatabase.Indices.ID,
          JournalDatabase.Indices.USER_NAME,
          JournalDatabase.Indices.MEMBER_ID,
          JournalDatabase.Indices.TASK_ID,
          JournalDatabase.Indices.PROJECT_ID,
          JournalDatabase.Indices.DESCRIPTION,
          JournalDatabase.Indices.JOURNAL_ENTRY_TYPE,
          JournalDatabase.Indices.POSITION,
          JournalDatabase.Indices.TIMESTAMP
        ]
      }
    );
    this.addCollection(
      JournalDatabase.Collections.PROJECTS,
      {
        indices: [JournalDatabase.Indices.ID]
      }
    );
    this.addCollection(JournalDatabase.Collections.TASKS, {
      indices: [
        JournalDatabase.Indices.ID,
        JournalDatabase.Indices.PROJECT_ID
      ]
    });
    this.getCollection(
      JournalDatabase.Collections.INTENTIONS
    ).addDynamicView(JournalDatabase.Views.INTENTIONS);
    this.getCollection(
      JournalDatabase.Collections.PROJECTS
    ).addDynamicView(JournalDatabase.Views.PROJECTS);
    this.getCollection(
      JournalDatabase.Collections.TASKS
    ).addDynamicView(JournalDatabase.Views.TASKS);
  }

  /**
   * gets our view  for our list of intentions
   * @returns {DynamicView}
   */
  getViewForIntentions() {
    let collection = this.getCollection(
      JournalDatabase.Collections.INTENTIONS
    );
    return collection.getDynamicView(
      JournalDatabase.Views.INTENTIONS
    );
  }

  /**
   * gets our view for our recent projects
   * @returns {DynamicView}
   */
  getViewForRecentProjects() {
    let collection = this.getCollection(
      JournalDatabase.Collections.PROJECTS
    );
    return collection.getDynamicView(
      JournalDatabase.Views.PROJECTS
    );
  }

  /**
   * gets our view for our teams recent tasks
   * @returns {DynamicView}
   */
  getViewForRecentTasks() {
    let collection = this.getCollection(
      JournalDatabase.Collections.TASKS
    );
    return collection.getDynamicView(
      JournalDatabase.Views.TASKS
    );
  }

  /**
   * updates our intention in our Journal Database. All intentions from
   * all users are stored in the same collection for speed. They can be
   * queried with username or member id.
   * @param doc
   * @param collection
   */
  findRemoveInsert(doc, collection) {
    let result = collection.findOne({ id: doc.id });
    if (result) {
      collection.remove(result);
    }
    collection.insert(doc);
  }
};
