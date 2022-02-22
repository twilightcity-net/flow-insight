import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import FlowIntentionsList from "./FlowIntentionsList";
import FlowChart from "./FlowChart";
/**
 * this component handles the main flow content for the /flow view
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
      cursorOffset: null
    }
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
          <FlowChart chartDto={this.props.chartDto} cursorOffset={this.state.cursorOffset}
                     hasRoomForClose={this.props.hasRoomForClose}/>
          <FlowIntentionsList chartDto={this.props.chartDto}
                              onHoverIntention={this.onHoverIntention}
                              onExitHoverIntention={this.onExitHoverIntention}/>
        </div>
      </div>
    );
  }

}
