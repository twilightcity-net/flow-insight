import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class ChartPopoutController extends ActiveViewController {


  static get ChartType() {
    return {
      TASK_FOR_WTF: "task-for-wtf"
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
  }

  //TODO okay so the chart that is listed here, needs to be the type of chart we're loading
  //here which could be anything, like I should be able to do a flow resource url
  //and have it load the flow resource into a separate view.

  //so when I load the chart, I need to get a resource loaded and then pass in a uri
  //that corresponds to what the view is supposed to be loading.

  //flow/project/proj1/task/task1
  //flow/wtf/circuitName

  //so next thing is just to get this plumbing url wired up.
  //our window name, is going to be specific to the url so if I load the same url
  //it reloads the page in the same window.

  //can just print the url to the chart screen as a starting point.

  openChartWindowForCircuitTask(circuitName) {
    console.log("circuitName on client: "+circuitName);
    this.openChartDispatcher.dispatch({
      chartType: ChartPopoutController.ChartType.TASK_FOR_WTF,
      circuitName: circuitName
    });
  }
}
