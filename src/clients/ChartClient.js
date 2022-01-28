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
   * @returns {{CHART_WTF: string, CHART_TASK: string}}
   * @constructor
   */
  static get Events() {
    return {
      CHART_WTF: "chart-wtf",
      CHART_TASK: "chart-task"
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
  static chartFrictionForTask(projectName, taskName, bucket, scope, callback) {
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
