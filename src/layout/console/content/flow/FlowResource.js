import React, {Component} from "react";
import {ChartClient} from "../../../../clients/ChartClient";
import {DimensionController} from "../../../../controllers/DimensionController";
import LatestWeekContent from "./components/latest/LatestWeekContent";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";

/**
 * this component is the tab panel wrapper for the flow content
 * @copyright Twilight City, Inc. 2022©®™√
 */
export default class FlowResource extends Component {
  /**
   * builds the flow layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FlowResource]";

    let closeOption = false;
    let arr = this.props.resource.uriArr;

    console.log(arr);
    if (arr.length > 1 && arr[1] === FlowResource.INTRO_OPTION) {
      closeOption = true;
    }

    this.state = {
      resource: props.resource,
      hasCloseOption: closeOption
    };
  }

  static INTRO_OPTION = "intro";

  /**
   * Load the chart when the component mounts
   */
  componentDidMount() {
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES
    );

    ChartClient.chartLatestWeek(
      this,
      (arg) => {
        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            chartDto: arg.data,
            visible: true
          });
        }
      }
    );
  }

  onClickClose = () => {
    console.log("Closing dashboard and navigating to journal");

    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.JOURNAL,
      "me"
    );
    this.myController.makeSidebarBrowserRequest(request);
  }

  onClickDayBox = (weekCoords, dayCoords) => {
    console.log("Closing dashboard and navigating to journal");

    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.DASHBOARD,
      "momentum",
      "user",
      "me",
      weekCoords,
      dayCoords
    );
    this.myController.makeSidebarBrowserRequest(request);
  }


  /**
   * renders the flow chart layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.FLOW_PANEL
    );

    return (
      <div
        id="component"
        className="flowDashboardLayout"
        style={{ height: height }}
      >
        <div id="wrapper" className="flowDashboardContent">
          <LatestWeekContent chartDto={this.state.chartDto}
                             visible={this.state.visible}
                             hasCloseOption={this.state.hasCloseOption}
                             onClickClose={this.onClickClose}
                             onClickDayBox={this.onClickDayBox}/>
        </div>
      </div>
    );
  }
}
