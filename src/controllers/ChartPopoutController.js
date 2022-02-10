import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class ChartPopoutController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.consoleIsCollapsed = true;

    this.openChartDispatcher =
    RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_OPEN_CHART,
      this
    );
  }

  openChartWindow(chartName) {
    this.openChartDispatcher.dispatch({
      chartName: chartName
    });
  }
}
