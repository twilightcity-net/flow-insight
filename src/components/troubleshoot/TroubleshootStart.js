import React, { Component } from "react";
import { Segment } from "semantic-ui-react";
import { ActiveCircleModel } from "../../models/ActiveCircleModel";
import { DataModelFactory } from "../../models/DataModelFactory";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class TroubleshootStart extends Component {
  /**
   * the constructor function that is called when creating a new TroubleshootSession
   * @param props - properties that are passed in from the troubleshoot layout
   */
  constructor(props) {
    super(props);
    this.name = "[TroubleshootSessionNew]";

    this.state = {
      activeCircle: null,
      circleName: null,
      circleOwner: "Me"
    };

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );
  }

  /**
   * called when the component first mounts
   */
  componentDidMount = () => {
    console.log(this.name + " - componentDidMount");
    this.activeCircleModel.registerListener(
      "TroubleshootSessionNew",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      this.onCircleUpdate
    );

    this.onCircleUpdate();
  };

  /**
   * called when the component is hidden
   */
  componentWillUnmount = () => {
    console.log(this.name + " - componentWillUnmount");

    this.activeCircleModel.unregisterAllListeners("TroubleshootSessionNew");
  };

  /**
   * local scoped callback that is called when the active circle needs updating
   */
  onCircleUpdate = () => {
    console.log(this.name + " - onCircleUpdate");

    this.setState({
      activeCircle: this.activeCircleModel.getActiveScope().activeCircle,
      circleName: this.activeCircleModel.getActiveScope().circleName,
      circleOwner: this.activeCircleModel.getActiveScope().getCircleOwner()
    });
  };

  /**
   * click handler for the wtf button. starts a session through a prop ref
   */
  onClickStartTroubleshooting = () => {
    console.log("start troubleshooting");

    this.props.onStartTroubleshooting();
  };

  /**
   * renders the default troubleshoot component in the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="troubleshootPanelDefault">
        <Segment
          textAlign={"center"}
          className="wtf-panel-start"
          inverted
          padded={"very"}
        >
          <div
            className="wtf-button-massive"
            onClick={this.onClickStartTroubleshooting}
          >
            WTF?
          </div>
          <Segment inverted size={"huge"} className="wtf-button-desc">
            <b>Start A Troubleshooting Session!</b>
          </Segment>
        </Segment>
      </div>
    );
  }
}
