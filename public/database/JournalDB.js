const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class is used to build new databases
 * @type {JournalDB}
 */
module.exports = class JournalDB extends LokiJS {
  static get Name() {
    return "journal";
  }

  /**
   * our collection in our database
   * @returns {{RECENT_INTENTIONS: string, RECENT_PROJECTS: string, RECENT_TASKS: string}}
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
   * @returns {{TASKS: string, PROJECTS: string, INTENTIONS_ME: string}}
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
   * @returns {{TIMESTAMP: string, USER_NAME: string, ID: string, TASK_ID: string, PROJECT_ID: string}}
   */
  static get Indices() {
    return {
      USER_NAME: "userName",
      TIMESTAMP: "timestamp",
      ID: "id",
      TASK_ID: "taskId",
      PROJECT_ID: "projectId"
    };
  }

  /**
   * builds our journal database
   */
  constructor() {
    super(JournalDB.Name);
    this.name = "[DB." + JournalDB.Name + "]";
    this.guid = Util.getGuid();
    this.addCollection(JournalDB.Collections.INTENTIONS, {
      indices: [
        JournalDB.Indices.ID,
        JournalDB.Indices.USER_NAME,
        JournalDB.Indices.TIMESTAMP,
        JournalDB.Indices.TASK_ID,
        JournalDB.Indices.PROJECT_ID
      ]
    });
    this.addCollection(JournalDB.Collections.PROJECTS, {
      indices: [JournalDB.Indices.ID]
    });
    this.addCollection(JournalDB.Collections.TASKS, {
      indices: [JournalDB.Indices.ID, JournalDB.Indices.PROJECT_ID]
    });
    this.getCollection(JournalDB.Collections.INTENTIONS).addDynamicView(
      JournalDB.Views.INTENTIONS
    );
    this.getCollection(JournalDB.Collections.PROJECTS).addDynamicView(
      JournalDB.Views.PROJECTS
    );
    this.getCollection(JournalDB.Collections.TASKS).addDynamicView(
      JournalDB.Views.TASKS
    );
  }

  getViewForIntentionsByUserName(name) {
    let collection = this.getCollection(JournalDB.Collections.INTENTIONS);
    return collection
      .getDynamicView(JournalDB.Views.INTENTIONS)
      .applyWhere(function aCustomFilter(obj) {
        return obj.userName === name;
      });
  }

  getViewForProjects() {
    let collection = this.getCollection(JournalDB.Collections.PROJECTS);
    return collection.getDynamicView(JournalDB.Views.PROJECTS);
  }

  getViewForTasks() {
    let collection = this.getCollection(JournalDB.Collections.PROJECTS);
    return collection.getDynamicView(JournalDB.Views.PROJECTS);
  }
};
