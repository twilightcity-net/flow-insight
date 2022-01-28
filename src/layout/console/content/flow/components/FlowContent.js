import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import FlowIntentionsList from "./FlowIntentionsList";
import FlowChart from "./FlowChart";
import {ChartClient} from "../../../../../clients/ChartClient";
/**
 * this component is the tab panel wrapper for the console content
 */
export default class FlowContent extends Component {
  /**
   * the constructor function which builds the FlowContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FlowContent.name + "]";
    this.state = {
      chartDto: null,
      cursorOffset: null
    }
  }

  /**
   * Load the chart when the component mounts
   */
  componentDidMount() {
    ChartClient.chartFrictionForTask(
      'tc-desktop',
      'tty',
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

  /**
   * When the user hovers over an intention, we need to update the cursor in the chart
   */
  onHoverIntention = (offset) => {
    this.setState({
      cursorOffset: offset
    });
  }

  /**
   * When the user exits all hovering over intentions, we need to clear the cursor in the chart
   */
  onExitHoverIntention = () => {
    this.setState({
      cursorOffset: null
    });
  }

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (
      <div
        id="component"
        className="flowContent"
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.FLOW_PANEL
          ),
        }}
      >
        <div className="flowContentWrapper">
          <FlowChart chartDto={this.state.chartDto} cursorOffset={this.state.cursorOffset}/>
          <FlowIntentionsList chartDto={this.state.chartDto}
                              onHoverIntention={this.onHoverIntention}
                              onExitHoverIntention={this.onExitHoverIntention}/>
        </div>
      </div>
    );
  }

  //need to make the whole box fit inside the remaining chart window, so whatever the full space was, minus,
  //the svg size should have an explicit height here on the section.

  //then the inner section here, should have a fixed height on the inner rows so they scroll

}
