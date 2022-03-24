import React, { Component } from "react";
import { ChartClient } from "../clients/ChartClient";
import FlowContent from "../layout/console/content/flow/components/FlowContent";
import { Icon } from "semantic-ui-react";
import { RendererControllerFactory } from "../controllers/RendererControllerFactory";
import { CircuitClient } from "../clients/CircuitClient";
import { TalkToClient } from "../clients/TalkToClient";
import { MemberClient } from "../clients/MemberClient";

/**
 *  This view class is used to show a floating draggable IFM chart
 */
export default class ChartView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartDto: null,
    };
  }

  componentDidMount() {
    TalkToClient.init(this);
    MemberClient.init(this);
    CircuitClient.init(this);
    ChartClient.init(this);

    if (this.props.routeProps.circuitName) {
      document.title =
        "Task Flow for " +
        this.props.routeProps.circuitName;
    } else if (this.props.routeProps.taskName) {
      document.title =
        "Task Flow for " +
        this.props.routeProps.taskName;
    }

    if (this.props.routeProps.circuitName) {
      this.loadChartFromCircuit(this.props.routeProps.circuitName);
    } else if (this.props.routeProps.taskName) {
      this.loadChartFromProjectTask(this.props.routeProps.projectName, this.props.routeProps.taskName);
    }

  }

  loadChartFromCircuit(circuitName) {

    ChartClient.chartFrictionForWTFTask(
      circuitName,
      "TWENTIES",
      this,
      (arg) => {
        console.log("chart data returnedx!");

        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            chartDto: arg.data,
          });
        } else {
          console.error(arg.error);
        }
      }
    );
  }

  loadChartFromProjectTask(projectName, taskName) {

    ChartClient.chartFrictionForTask(
      projectName, taskName,
      "TWENTIES",
      this,
      (arg) => {
        console.log("task data returnedx!");

        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            chartDto: arg.data,
          });
        } else {
          console.error(arg.error);
        }
      }
    );
  }

  onClickClose = () => {
    let chartPopoutController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CHART_POPOUT,
        this
      );

    if (this.props.routeProps.circuitName) {
      chartPopoutController.closeChartWindowForCircuitTask(
        this.props.routeProps.circuitName
      );
    } else if (this.props.routeProps.taskName) {
      chartPopoutController.closeChartWindowForTask(
        this.props.routeProps.projectName,
        this.props.routeProps.taskName
      );
    }
  };

  /// renders the view into our root element of our window
  render() {
    return (
      <div id="component" className="chartLayout">
        <div className="closeIcon">
          <Icon
            name="close"
            size="large"
            onClick={this.onClickClose}
          />
        </div>
        <div id="component" className="flowLayout">
          <div id="wrapper" className="flowContent">
            <FlowContent
              selectedCircuitName={
                this.props.routeProps.circuitName
              }
              chartDto={this.state.chartDto}
              hasRoomForClose={true}
            />
          </div>
        </div>
      </div>
    );
  }
}
