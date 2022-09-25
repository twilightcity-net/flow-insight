import React, { Component } from "react";
import { ChartClient } from "../clients/ChartClient";
import FlowContent from "../layout/console/content/flow/components/flowmap/FlowContent";
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

  static get ChartType() {
    return {
      TASK_FOR_WTF: "task-for-wtf",
      TASK_BY_NAME: "task-by-name",
      DAY_CHART: "day-chart"
    };
  }

  componentDidMount() {
    TalkToClient.init(this);
    MemberClient.init(this);
    CircuitClient.init(this);
    ChartClient.init(this);

    const chartType = this.props.routeProps.chartType;

    if (chartType === ChartView.ChartType.TASK_FOR_WTF) {
      document.title = "Task Flow for " + this.props.routeProps.circuitName;
      this.loadChartFromCircuit(this.props.routeProps.circuitName);

    } else if (chartType === ChartView.ChartType.TASK_BY_NAME) {
      document.title = "Task Flow for " + this.props.routeProps.taskName;
      this.loadChartFromProjectTask(
        this.props.routeProps.projectName,
        this.props.routeProps.taskName,
        this.props.routeProps.username
      );

    } else if (chartType === ChartView.ChartType.DAY_CHART) {
      document.title = "Day Flow for " + this.props.routeProps.gtCoords;
      this.loadChartForDay(this.props.routeProps.gtCoords);
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


  /**
   * Load chart data for a specific day.  Assumes gtCoords are day coords
   * @param gtCoords
   */
  loadChartForDay(gtCoords) {
    ChartClient.chartFrictionForDay(
      gtCoords,
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

  loadChartFromProjectTask(
    projectName,
    taskName,
    username
  ) {
    ChartClient.chartFrictionForTaskForUser(
      projectName,
      taskName,
      username,
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

    const chartType = this.props.routeProps.chartType;

    let chartPopoutController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CHART_POPOUT,
        this
      );

    if (chartType === ChartView.ChartType.DAY_CHART) {
      chartPopoutController.closeChartWindowForDay(
        MemberClient.me.username,
        this.props.routeProps.gtCoords);
    } else if (chartType === ChartView.ChartType.TASK_FOR_WTF) {
      chartPopoutController.closeChartWindowForCircuitTask(
        this.props.routeProps.circuitName
      );
    } else if (chartType === ChartView.ChartType.TASK_BY_NAME) {
      chartPopoutController.closeChartWindowForTask(
        this.props.routeProps.projectName,
        this.props.routeProps.taskName,
        this.props.routeProps.username
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
              chartType={this.props.routeProps.chartType}
              chartDto={this.state.chartDto}
              hasRoomForClose={true}
            />
          </div>
        </div>
      </div>
    );
  }
}
