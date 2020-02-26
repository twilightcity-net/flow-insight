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
    super(JournalDatabase.Name);
    this.name = "[DB." + JournalDatabase.Name + "]";
    this.guid = Util.getGuid();
    this.addCollection(JournalDatabase.Collections.INTENTIONS, {
      indices: [
        JournalDatabase.Indices.ID,
        JournalDatabase.Indices.USER_NAME,
        JournalDatabase.Indices.TIMESTAMP,
        JournalDatabase.Indices.TASK_ID,
        JournalDatabase.Indices.PROJECT_ID
      ]
    });
    this.addCollection(JournalDatabase.Collections.PROJECTS, {
      indices: [JournalDatabase.Indices.ID]
    });
    this.addCollection(JournalDatabase.Collections.TASKS, {
      indices: [JournalDatabase.Indices.ID, JournalDatabase.Indices.PROJECT_ID]
    });
    this.getCollection(JournalDatabase.Collections.INTENTIONS).addDynamicView(
      JournalDatabase.Views.INTENTIONS
    );
    this.getCollection(JournalDatabase.Collections.PROJECTS).addDynamicView(
      JournalDatabase.Views.PROJECTS
    );
    this.getCollection(JournalDatabase.Collections.TASKS).addDynamicView(
      JournalDatabase.Views.TASKS
    );
  }

  /**
   * returns the view for a speofic users intentions that is store locally. We also
   * apply a sort on the timestamp
   * @param name
   * @returns {DynamicView}
   */
  getViewForIntentionsByUserName(name) {
    let collection = this.getCollection(JournalDatabase.Collections.INTENTIONS),
      view = collection.getDynamicView(JournalDatabase.Views.INTENTIONS);
    view.removeFilters();
    view.applyWhere(obj => {
      return obj.userName === name;
    });
    view.applySimpleSort(JournalDatabase.Indices.TIMESTAMP);
    return view;
  }

  getViewForProjects() {
    let collection = this.getCollection(JournalDatabase.Collections.PROJECTS);
    return collection.getDynamicView(JournalDatabase.Views.PROJECTS);
  }

  getViewForTasks() {
    let collection = this.getCollection(JournalDatabase.Collections.PROJECTS);
    return collection.getDynamicView(JournalDatabase.Views.PROJECTS);
  }
};
