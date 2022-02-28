import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import FlowIntentionsList from "./FlowIntentionsList";
import FlowChart from "./FlowChart";
import { CircuitClient } from "../../../../../clients/CircuitClient";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import FlowTroubleshootingFeed from "./FlowTroubleshootingFeed";
import { MemberClient } from "../../../../../clients/MemberClient";

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
      cursorOffset: null,
      selectedOffset: null,
    };
  }

  componentDidMount() {
    //if the circuitName is set, then we've got a context coming into this
    //of the circuit we're on, and we may need to load up the context for that circuit
  }

  onCircuitClick = (circuitLink) => {
    console.log("clicked on " + circuitLink);

    let circuitName = circuitLink.substr(
      circuitLink.lastIndexOf("/") + 1
    );

    CircuitClient.getCircuitWithAllDetails(
      circuitName,
      this,
      (arg) => {
        if (!arg.error) {
          this.circuit = arg.data;

          TalkToClient.getAllTalkMessagesFromRoom(
            this.circuit.wtfTalkRoomName,
            this.circuit.wtfTalkRoomId,
            this,
            (arg) => {
              if (!arg.error) {
                this.messages = arg.data;

                this.setState({
                  circuit: this.circuit,
                  circuitMembers:
                    this.circuit.circuitParticipants,
                  troubleshootMessages: this.messages,
                  me: MemberClient.me,
                  selectedOffset: null,
                });
              } else {
                console.error("error " + arg.error);
              }
            }
          );
        } else {
          console.error("error " + arg.error);
        }
      }
    );

    //need the talk messages
    //the circuit
  };

  onClickOffCircuit = () => {
    this.setState({
      circuit: null,
      circuitMembers: null,
      troubleshootMessages: null,
    });
    console.log("on click off circuit");
  };
  /**
   * When the user hovers over an intention, we need to update the cursor in the chart
   */
  onHoverIntention = (offset) => {
    this.setState({
      cursorOffset: offset,
    });
  };

  /**
   * When the user clicks an intention and it turns active
   */
  onClickIntention = (offset) => {
    this.setState({
      selectedOffset: offset,
    });
  };

  /**
   * When the user exits all hovering over intentions, we need to clear the cursor in the chart
   */
  onExitHoverIntention = () => {
    this.setState({
      cursorOffset: null,
    });
  };

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    let flowContent = (
      <div id="component" className="loadingChart">
        Loading...
      </div>
    );

    let innerDetails;

    if (
      this.state.circuit &&
      this.state.troubleshootMessages
    ) {
      innerDetails = (
        <FlowTroubleshootingFeed
          circuit={this.state.circuit}
          me={this.state.me}
          circuitMembers={this.state.circuitMembers}
          troubleshootMessages={
            this.state.troubleshootMessages
          }
        />
      );
    } else {
      innerDetails = (
        <FlowIntentionsList
          chartDto={this.props.chartDto}
          onHoverIntention={this.onHoverIntention}
          onClickIntention={this.onClickIntention}
          onExitHoverIntention={this.onExitHoverIntention}
        />
      );
    }

    if (this.props.chartDto) {
      let selectedCircuitName =
        this.props.selectedCircuitName;
      if (this.state.circuit) {
        selectedCircuitName =
          this.state.circuit.circuitName;
      }

      flowContent = (
        <div className="flowContentWrapper">
          <FlowChart
            selectedCircuitName={selectedCircuitName}
            chartDto={this.props.chartDto}
            cursorOffset={this.state.cursorOffset}
            selectedOffset={this.state.selectedOffset}
            hasRoomForClose={this.props.hasRoomForClose}
            onCircuitClick={this.onCircuitClick}
            onClickOffCircuit={this.onClickOffCircuit}
          />
          {innerDetails}
        </div>
      );
    }

    let height = DimensionController.getHeightFor(
      DimensionController.Components.FLOW_PANEL
    );
    return (
      <div
        id="component"
        className="flowContent"
        style={{
          height: height,
        }}
      >
        {flowContent}
      </div>
    );
  }
}
