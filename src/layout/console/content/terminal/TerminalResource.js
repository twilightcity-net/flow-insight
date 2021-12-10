import React, { Component } from "react";
import TerminalContent from "./components/TerminalContent";
import { TerminalClient } from "../../../../clients/TerminalClient";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";

/**
 * this component is the tab panel wrapper for the terminal resource
 * @copyright Twilight City, Inc. 2021©®™√
 */
export default class TerminalResource extends Component {
  /**
   * builds the terminal layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TerminalResource]";
    this.state = {
      resource: props.resource,
      commandManual: null,
      terminalCircuit: null,
    };
    this.loadCount = 0;

    this.resourcesController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.RESOURCES,
        this
      );
  }

  componentDidMount() {

    this.loadCount = 0;

    TerminalClient.getManual(this, (arg) => {
       this.commandManual = arg.data;
       this.loadCount++;

       this.initializeWhenLoadingDone();
    });

    TerminalClient.createSession(this, (arg) => {

       this.terminalCircuit = arg.data;
       this.loadCount++;

       this.initializeWhenLoadingDone();
    });

  }

  initializeWhenLoadingDone() {
    if (this.loadCount === 2) {
      this.setState({
        commandManual: this.commandManual,
        terminalCircuit: this.terminalCircuit
      });

      this.resourcesController.joinExistingRoomWithRoomId(this.terminalCircuit.talkRoomId);

    }
  }

  componentWillUnmount() {
    if (this.state.terminalCircuit) {
      this.resourcesController.leaveExistingRoomWithRoomId(this.state.terminalCircuit.talkRoomId);
    }
  }

  /**
   * renders the terminal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    return (
      <div id="component" className="terminalLayout">
        <div id="wrapper" className="terminalContent">
          <TerminalContent
            terminalCircuit={this.state.terminalCircuit}
            commandManual={this.state.commandManual}
          />
        </div>
      </div>
    );
  }
}
