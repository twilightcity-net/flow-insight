import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";
import UtilRenderer from "../UtilRenderer";

/**
 * this class is used to query gridtime for chart data
 */
export class ChartClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  static SECONDS_IN_FOUR = 60 * 20 * 12;
  static SECONDS_IN_DAY = 60 * 20 * 12 * 6;
  static SECONDS_IN_WEEK = 60 * 20 * 12 * 6 * 7;

  static CIRCUIT_LINK_PREFIX = "/wtf/";

  /**
   * builds the Client for chart requests in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[ChartClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.CHART_CLIENT,
      this,
      null,
      this.onChartEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{CHART_WTF: string, CHART_TOP_BOXES: string, CHART_TOP_FILES_FOR_BOX_FOR_USER: string, CHART_TOP_BOXES_FOR_USER: string, CHART_TOP_BOXES_FOR_TEAM: string, CHART_TOP_FILES_FOR_BOX_FOR_TEAM: string, CHART_TOP_FILES_FOR_BOX: string, CHART_TASK: string, CHART_TASK_FOR_WTF: string}}
   * @constructor
   */
  static get Events() {
    return {
      CHART_WTF: "chart-wtf",
      CHART_TASK: "chart-task",
      CHART_TASK_FOR_WTF: "chart-task-for-wtf",
      CHART_TOP_BOXES: "chart-top-boxes",
      CHART_TOP_FILES_FOR_BOX: "chart-top-files-for-box",
      CHART_TOP_BOXES_FOR_TEAM: "chart-top-boxes-for-team",
      CHART_TOP_BOXES_FOR_USER: "chart-top-boxes-for-user",
      CHART_TOP_FILES_FOR_BOX_FOR_TEAM: "chart-top-files-for-box-for-team",
      CHART_TOP_FILES_FOR_BOX_FOR_USER: "chart-top-files-for-box-for-user"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!ChartClient.instance) {
      ChartClient.instance = new ChartClient(scope);
    }
  }

  /**
   * Chart friction for a specific project/task at a specific bucket resolution
   * Will default to twenties if no bucket is provided
   * @param projectName
   * @param taskName
   * @param bucket (optional)
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartFrictionForTask(
    projectName,
    taskName,
    bucket,
    scope,
    callback
  ) {
    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_TASK,
      {
        projectName: projectName,
        taskName: taskName,
        bucket: bucket,
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }


  /**
   * Chart top boxes in a particular time period
   * @param timeScope
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartTopBoxes(
    timeScope,
    scope,
    callback
  ) {
    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_TOP_BOXES,
      {
        timeScope: timeScope,
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }




  /**
   * Chart top boxes in a particular time period for a specific user
   * @param username
   * @param timeScope
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartTopBoxesForUser(
    username,
    timeScope,
    scope,
    callback
  ) {
    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_TOP_BOXES_FOR_USER,
      {
        username: username,
        timeScope: timeScope,
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }



  /**
   * Chart top boxes in a particular time period for the team
   * @param teamName
   * @param timeScope
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartTopBoxesForTeam(
    teamName,
    timeScope,
    scope,
    callback
  ) {
    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_TOP_BOXES_FOR_TEAM,
      {
        teamName: teamName,
        timeScope: timeScope,
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }



  /**
   * Chart top files in a particular time period for a box
   * @param timeScope
   * @param project
   * @param box
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartTopFilesForBox(
    timeScope,
    project,
    box,
    scope,
    callback
  ) {
    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_TOP_FILES_FOR_BOX,
      {
        timeScope: timeScope,
        project: project,
        box: box
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }


  /**
   * Chart top files in a particular time period for a box for a team
   * @param teamName
   * @param timeScope
   * @param project
   * @param box
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartTopFilesForBoxForTeam(
    teamName,
    timeScope,
    project,
    box,
    scope,
    callback
  ) {
    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_TOP_FILES_FOR_BOX_FOR_TEAM,
      {
        teamName: teamName,
        timeScope: timeScope,
        project: project,
        box: box
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }



  /**
   * Chart top files in a particular time period for a box for a team
   * @param username
   * @param timeScope
   * @param project
   * @param box
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartTopFilesForBoxForUser(
    username,
    timeScope,
    project,
    box,
    scope,
    callback
  ) {
    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_TOP_FILES_FOR_BOX_FOR_USER,
      {
        username: username,
        timeScope: timeScope,
        project: project,
        box: box
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }

  /**
   * Chart friction for a task corresponding to a wtf link
   * Will default to twenties if no bucket is provided
   * @param circuitName
   * @param bucket (optional)
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartFrictionForWTFTask(
    circuitName,
    bucket,
    scope,
    callback
  ) {
    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_TASK_FOR_WTF,
      {
        circuitPath:
          ChartClient.CIRCUIT_LINK_PREFIX + circuitName,
        bucket: bucket,
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }

  /**
   * retrieve chart details including top files, exec, and graph points for a specific wtf
   * @param circuit
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static chartFrictionForWTF(circuit, scope, callback) {
    let seconds =
      UtilRenderer.getWtfSecondsFromCircuit(circuit);
    let bucket = "TWENTIES";

    if (seconds > this.SECONDS_IN_FOUR * 4) {
      bucket = "FOURS";
    }
    if (seconds > this.SECONDS_IN_DAY * 4) {
      bucket = "DAYS";
    }
    if (seconds > this.SECONDS_IN_WEEK * 4) {
      bucket = "WEEKS";
    }

    let event = ChartClient.instance.createClientEvent(
      ChartClient.Events.CHART_WTF,
      {
        circuitPath: "/wtf/" + circuit.circuitName,
        bucket: bucket,
      },
      scope,
      callback
    );

    ChartClient.instance.notifyChart(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its recieved the response from the main process. the
   * call back is bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onChartEventReply = (event, arg) => {
    let clientEvent = ChartClient.replies.get(arg.id);
    this.logReply(
      ChartClient.name,
      ChartClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      ChartClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process chart that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyChart(clientEvent) {
    console.log(
      "[" +
        ChartClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    ChartClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
