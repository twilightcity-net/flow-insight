import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import FlowIntentionsList from "../../flow/components/FlowIntentionsList";
import FlowChart from "../../flow/components/FlowChart";
import FlowTroubleshootingFeed from "./FlowTroubleshootingFeed";
/**
 * this component handles the main retro intro content, before a retro is started
 * and we want to show the flow context for review.
 */
export default class FlowRetro extends Component {
  /**
   * the constructor function which builds the FlowRetro component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FlowRetro.name + "]";
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

  //TODO need to the troubleshooting session rendering next
  //then the timer, and start retro button
  //maybe put the intentions in a toggleable panel so you can see them too
  //maybe clicking on a wtf changes the display?  should popout to the parent to handle
  //handle data not available, and piecewise loading properly
  //hover task description over the task name
  //task switches
  //then the db caching for the chart objects to make this faster
  //the trouble sessions are also cacheable once the session is closed

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
          <FlowChart chartDto={this.props.taskChartDto}
                     cursorOffset={this.state.cursorOffset}
                     selectedWtf={this.props.circuit}/>

          <FlowTroubleshootingFeed circuit={this.props.circuit}
                                   me={this.props.me}
                                   circuitMembers={this.props.circuitMembers}
                                   troubleshootMessages={this.props.troubleshootMessages} />

          {/*<FlowIntentionsList chartDto={this.props.taskChartDto}*/}
          {/*                    onHoverIntention={this.onHoverIntention}*/}
          {/*                    onExitHoverIntention={this.onExitHoverIntention}/>*/}
        </div>
      </div>
    );
  }


}
