const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

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
      TASKS: "tasks",
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
      TASKS: "tasks",
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
      TIMESTAMP: "timestamp",
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
          JournalDatabase.Indices.TIMESTAMP,
        ],
      }
    );
    this.addCollection(
      JournalDatabase.Collections.PROJECTS,
      {
        indices: [JournalDatabase.Indices.ID],
      }
    );
    this.addCollection(JournalDatabase.Collections.TASKS, {
      indices: [
        JournalDatabase.Indices.ID,
        JournalDatabase.Indices.PROJECT_ID,
      ],
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
  getViewForProjects() {
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
  getViewForTasks() {
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
   * @deprecated
   */
  findRemoveInsert(doc, collection) {
    let result = collection.findOne({ id: doc.id });
    if (result) {
      collection.remove(result);
    }
    result = Object.assign({}, doc);
    collection.insert(result);
  }

  /**
   * create project task in the system database
   * @param task
   */
  addNewTask(task) {
    let collection = this.getCollection(
      JournalDatabase.Collections.TASKS
    );
    collection.insert(task);
  }

  /**
   * create project in the system and database
   * @param project
   */
  addNewProject(project) {
    let collection = this.getCollection(
      JournalDatabase.Collections.PROJECTS
    );
    collection.insert(project);
  }

  /**
   * updates our local databases journals projects. this is used for our
   * journal drop down. not project management.
   * @param projects
   */
  updateJournalProjects(projects) {
    if (projects && projects.length > 0) {
      let collection = this.getCollection(
        JournalDatabase.Collections.PROJECTS
      );
      for (let i = 0; i < projects.length; i++) {
        this.findRemoveInsert(projects[i], collection);
      }
    }
  }

  /**
   * updates our local database with our recent tasks for specific journal
   * projects and such.
   * @param tasks
   */
  updateJournalTasks(tasks) {
    if (tasks) {
      let collection = this.getCollection(
        JournalDatabase.Collections.TASKS
      );
      for (let [p, t] of Object.entries(tasks)) {
        for (let i = 0; i < t.length; i++) {
          this.findRemoveInsert(t[i], collection);
        }
      }
    }
  }

  /**
   * update the intention in our local databaseb y matching the id. Also
   * updates the timestamp with our commons Util function.
   * @param intention
   */
  updateIntention(intention) {
    let collection = this.getCollection(
      JournalDatabase.Collections.INTENTIONS
    );
    intention.timestamp = Util.getTimestampFromUTCStr(
      intention.positionStr
    );
    DatabaseUtil.findRemoveInsert(intention, collection);
    DatabaseUtil.log(
      "update journal intention",
      intention.id
    );
  }

  /**
   * updates our journals intentions in our local databases collection
   * this is usually updated from talk messages however some the api
   * can also call this when we load a users journal
   * @param intentions
   */
  updateJournalIntentions(intentions) {
    if (intentions && intentions.length > 0) {
      let collection = this.getCollection(
        JournalDatabase.Collections.INTENTIONS
      );
      for (let i = 0; i < intentions.length; i++) {
        intentions[i].timestamp =
          Util.getTimestampFromUTCStr(
            intentions[i].positionStr
          );
        this.findRemoveInsert(intentions[i], collection);
      }
    }
  }
};
