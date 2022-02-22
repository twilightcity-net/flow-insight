import React, {Component} from "react";
import {ChartClient} from "../clients/ChartClient";
import FlowContent from "../layout/console/content/flow/components/FlowContent";
import {Icon} from "semantic-ui-react";
import {RendererControllerFactory} from "../controllers/RendererControllerFactory";

/**
 *  This view class is used to show a floating draggable IFM chart
 */
export default class ChartView extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    ChartClient.init(this);

    if (this.props.routeProps) {
      document.title = "Task Flow for "+this.props.routeProps.circuitName;
    }

    ChartClient.chartFrictionForTask(
      'tc-desktop',
      'fervie-shoes',
      'TWENTIES',
      this,
      (arg) => {
        console.log("chart data returnedx!");

        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            chartDto: arg.data
          });
        }
      }
    );
  }

  onClickClose = () => {
    let chartPopoutController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CHART_POPOUT, this);

    chartPopoutController.closeChartWindowForCircuitTask(this.props.routeProps.circuitName);

  }

  /// renders the view into our root element of our window
  render() {
    return (
      <div id="component" className="chartLayout">
        <div className="closeIcon">
          <Icon name="close" size="large" onClick={this.onClickClose}/>
        </div>
      <div id="component" className="flowLayout">
        <div id="wrapper" className="flowContent">
          <FlowContent chartDto={this.state.chartDto} hasRoomForClose={true}/>
        </div>
      </div>
    </div>
    );
  }
}
