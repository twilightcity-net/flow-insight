import React, { Component } from "react";
import { Segment } from "semantic-ui-react";
import { ActiveCircleModel } from "../../models/ActiveCircleModel";
import { DataModelFactory } from "../../models/DataModelFactory";
import { DimensionController } from "../../controllers/DimensionController";

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
    this.name = "[TroubleshootStart]";
    console.log(props);
    this.myController = props.ctlr;

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
   * renders the default troubleshoot component in the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="troubleshootContent">
        <Segment
          textAlign={"center"}
          className="wtf-panel-start"
          inverted
          padded={"very"}
          style={{
            height: DimensionController.getHeightFor(this)
          }}
        >
          <div
            className="wtf-button-massive"
            onClick={this.myController.onStartTroubleshooting}
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
