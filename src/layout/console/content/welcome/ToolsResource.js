import React, {Component} from "react";
import ToolsPanel from "./components/ToolsPanel";
import UtilRenderer from "../../../../UtilRenderer";

/**
 * this component is the tab panel for the intro tools screen
 */
export default class ToolsResource extends Component {
  /**
   * builds our resource with the given properties
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ToolsResource]";
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
   * renders the layout of the welcome tools menu
   * @returns {*} - the JSX to render
   */
  render() {
    let toolsPanel = (
      <ToolsPanel resource={this.props.resource} />
    );

    if (this.state.error) {
      toolsPanel = UtilRenderer.getErrorPage(
        this.state.errorContext,
        this.state.error
      );
    }

    return (
      <div id="component" className="welcomeLayout">
        <div id="wrapper" className="welcomeContent">
          {toolsPanel}
        </div>
      </div>
    );
  }
}
