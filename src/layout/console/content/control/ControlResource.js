import React, {Component} from "react";
import {DimensionController} from "../../../../controllers/DimensionController";
import {Segment} from "semantic-ui-react";

/**
 * this component is the tab panel for the control chart screen
 */
export default class ControlResource extends Component {
  /**
   * builds our resource with the given properties
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ControlResource]";
    this.state = {
      error: null,
    };
  }


  handleError(event, arg) {
    console.error(arg.error);
    this.setState({
      errorContext: arg.context,
      error: arg.error,
    });
  }

  handleDisplayError(errorContext, error) {
    console.error(error);
    this.setState({
      errorContext: errorContext,
      error: error,
    });
  }


  /**
   * renders the layout of the control chart
   * @returns {*} - the JSX to render
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.CONTROL_PANEL
    );


    // <div
    //   id="component"
    //   className="controlLayout"
    //   style={{ height: height }}
    // >

    return (
      <Segment
        className="controlLayout"
        textAlign={"center"}
        inverted
        padded={"very"}
        style={{
          height: height,
        }}
      >
        <div id="wrapper" className="controlContent">
          Hello there!
        </div>
      </Segment>

    );
  }
}
