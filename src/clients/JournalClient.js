import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * this class is used to converse with gridtime about a specific journal of intentions
 */
export class JournalClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for a Circuit in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[JournalClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.JOURNAL_CLIENT,
      this,
      null,
      this.onJournalEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {String}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_RECENT_JOURNAL: "load-recent-journal",
      CREATE_INTENTION: "create-intention",
      CREATE_TASK_REFERENCE: "create-task-reference",
      GET_RECENT_INTENTIONS: "get-recent-intentions",
      GET_RECENT_PROJECTS: "get-recent-projects",
      GET_RECENT_TASKS: "get-recent-tasks"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!JournalClient.instance) {
      JournalClient.instance = new JournalClient(scope);
    }
  }

  /**
   * loads our most recent journal items from grid
   * @param userName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadRecentJournal(userName, scope, callback) {
    let event = JournalClient.instance.createClientEvent(
      JournalClient.Events.LOAD_RECENT_JOURNAL,
      { userName: userName },
      scope,
      callback
    );
    JournalClient.instance.notifyJournal(event);
    return event;
  }

  /**
   * creates a new intention in our database and grid
   * @param projectId
   * @param taskId
   * @param description
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static createIntention(projectId, taskId, description, scope, callback) {
    let event = JournalClient.instance.createClientEvent(
      JournalClient.Events.CREATE_INTENTION,
      { projectId: projectId, taskId: taskId, description: description },
      scope,
      callback
    );
    JournalClient.instance.notifyJournal(event);
    return event;
  }
  /**
   * gets our most recent journal items from local db
   * @param userName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getRecentIntentions(userName, scope, callback) {
    let event = JournalClient.instance.createClientEvent(
      JournalClient.Events.GET_RECENT_INTENTIONS,
      { userName: userName },
      scope,
      callback
    );
    JournalClient.instance.notifyJournal(event);
    return event;
  }

  /**
   * gets our most recent projects for our dropdown
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getRecentProjects(scope, callback) {
    let event = JournalClient.instance.createClientEvent(
      JournalClient.Events.GET_RECENT_PROJECTS,
      {},
      scope,
      callback
    );
    JournalClient.instance.notifyJournal(event);
    return event;
  }

  /**
   * creates a task reference in grid time
   * @param taskName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static createTaskReference(taskName, scope, callback) {
    let event = JournalClient.instance.createClientEvent(
      JournalClient.Events.CREATE_TASK_REFERENCE,
      { taskName: taskName },
      scope,
      callback
    );
    JournalClient.instance.notifyJournal(event);
    return event;
  }

  /**
   * gets our most recent task for the user from our local db
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getRecentTasks(scope, callback) {
    let event = JournalClient.instance.createClientEvent(
      JournalClient.Events.GET_RECENT_TASKS,
      {},
      scope,
      callback
    );
    JournalClient.instance.notifyJournal(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its recieved the response from the main process. the
   * call back is bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onJournalEventReply = (event, arg) => {
    let clientEvent = JournalClient.replies.get(arg.id);
    this.logReply(
      JournalClient.name,
      JournalClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      JournalClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process journal that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyJournal(clientEvent) {
    console.log(
      "[" + JournalClient.name + "] notify -> " + JSON.stringify(clientEvent)
    );
    JournalClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
