import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class ChartPopoutController extends ActiveViewController {
  static get ChartType() {
    return {
      TASK_FOR_WTF: "task-for-wtf",
      TASK_BY_NAME: "task-by-name",
      DAY_CHART: "day-chart"
    };
  }

  constructor(scope) {
    super(scope);

    this.consoleIsCollapsed = true;

    this.openChartDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_OPEN_CHART,
        this
      );

    this.closeChartDispatcher =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_CHART,
        this
      );
  }

  /**
   * Open a chart popup for a specific circuit
   * @param circuitName
   */
  openChartWindowForCircuitTask(circuitName) {
    console.log("open circuit chart for " + circuitName);
    this.openChartDispatcher.dispatch({
      chartType: ChartPopoutController.ChartType.TASK_FOR_WTF,
      circuitName: circuitName,
    });
  }

  /**
   * Open a chart popup for a specific day
   * @param username
   * @param gtCoords
   */
  openChartWindowForDay(username, gtCoords) {
    console.log("open day chart for: " + gtCoords);
    this.openChartDispatcher.dispatch({
      chartType: ChartPopoutController.ChartType.DAY_CHART,
      username: username,
      gtCoords: gtCoords,
    });
  }


  /**
   * Open a chart popup for a specific project/task
   * @param projectName
   * @param taskName
   * @param username
   */
  openChartWindowForTask(projectName, taskName, username) {
    console.log("open task chart for: " + taskName);
    this.openChartDispatcher.dispatch({
      chartType: ChartPopoutController.ChartType.TASK_BY_NAME,
      projectName: projectName,
      taskName: taskName,
      username: username,
    });
  }

  /**
   * Close a chart popup window for a specific circuit
   * @param circuitName
   */
  closeChartWindowForCircuitTask(circuitName) {
    console.log("close circuit chart for: " + circuitName);
    this.closeChartDispatcher.dispatch({
      chartType: ChartPopoutController.ChartType.TASK_FOR_WTF,
      circuitName: circuitName,
    });
  }

  /**
   * Close a chart popup window for a specific day chart
   * @param username
   * @param gtCoords
   */
  closeChartWindowForDay(username, gtCoords) {
    console.log("close day chart for: " + gtCoords);
    this.closeChartDispatcher.dispatch({
      chartType: ChartPopoutController.ChartType.DAY_CHART,
      username: username,
      gtCoords: gtCoords,
    });
  }

  /**
   * Close a chart popup window for a specific project/task
   * @param projectName
   * @param taskName
   * @param username
   */
  closeChartWindowForTask(projectName, taskName, username) {
    console.log("close task chart for: " + taskName);
    this.closeChartDispatcher.dispatch({
      chartType: ChartPopoutController.ChartType.TASK_BY_NAME,
      projectName: projectName,
      taskName: taskName,
      username: username,
    });
  }
}
