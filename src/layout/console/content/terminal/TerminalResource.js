import React, { Component } from "react";
import TerminalContent from "./components/TerminalContent";
import { TerminalClient } from "../../../../clients/TerminalClient";
import { MemberClient } from "../../../../clients/MemberClient";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { TalkToClient } from "../../../../clients/TalkToClient";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import UtilRenderer from "../../../../UtilRenderer";

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

    this.terminalHandle = React.createRef();

    this.state = {
      resource: props.resource,
      commandManual: null,
      terminalCircuit: null,
      baseCircuitShelf: null,
      isBaseCircuit: true,
      me: MemberClient.me,
    };
    this.loadCount = 0;

    this.resourcesController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.RESOURCES,
        this
      );

    this.circuitJoinRoomFailListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_JOIN_EXISTING_ROOM_FAIL,
        this,
        this.handleJoinError
      );
  }

  componentDidMount() {
    this.loadCount = 0;

    TerminalClient.getManual(this, (arg) => {
      this.commandManual = arg.data;
      this.loadCount++;

      this.initializeWhenLoadingDone(arg);
    });

    TerminalClient.createCircuit(this, (arg) => {
      this.terminalCircuit = arg.data;
      this.loadCount++;

      this.initializeWhenLoadingDone(arg);
    });
  }

  initializeWhenLoadingDone(arg) {
    if (arg.error) {
      this.handleError("Failed to initialize", arg.error);
    } else {
      if (this.loadCount === 2) {
        this.setState({
          commandManual: this.commandManual,
          terminalCircuit: this.terminalCircuit,
        });

        this.resourcesController.joinExistingRoomWithRoomId(
          this.terminalCircuit.talkRoomId
        );

        if (this.props.resource.uriArr.length > 1) {
          let terminalName = this.props.resource.uriArr[1];
          this.joinTty("/terminal/" + terminalName, true);
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.state.terminalCircuit) {
      this.resourcesController.leaveTerminalCircuit(
        this.state.terminalCircuit.circuitName
      );
      this.resourcesController.leaveExistingRoomWithRoomId(
        this.state.terminalCircuit.talkRoomId
      );
    }
  }

  joinTty = (terminalPath, loadMessages) => {
    let output = "";
    if (terminalPath.includes("/terminal/")) {
      let circuitName = terminalPath.substring(
        terminalPath.indexOf("/terminal/") + 10
      );

      if (
        circuitName !== this.terminalCircuit.circuitName
      ) {
        output = "Joining " + terminalPath + "...";
        //
        // let that = this;

        TerminalClient.joinCircuit(
          circuitName,
          this,
          (arg) => {
            if (arg.error) {
              console.error(arg.error);
              this.terminalHandle.current.pushErrorMessage(arg.error);
            } else {
              let newCircuit = arg.data;

              this.resourcesController.leaveExistingRoomWithRoomId(
                this.state.terminalCircuit.talkRoomId
              );
              this.resourcesController.joinExistingRoomWithRoomId(
                newCircuit.talkRoomId
              );

              this.setState((prevState) => {
                return {
                  baseCircuitShelf:
                    prevState.terminalCircuit,
                  terminalCircuit: newCircuit,
                  isBaseCircuit: false,
                };
              });

              if (loadMessages) {
                TalkToClient.getAllTalkMessagesFromRoom(
                  newCircuit.talkRoomId,
                  newCircuit.talkRoomId,
                  this,
                  (arg) => {
                    if (arg.error) {
                      this.handleError("Failed to get room messages", arg.error);
                    } else {
                      this.terminalHandle.current.pushTalkMessageHistory(
                        arg.data
                      );
                    }
                  }
                );
              }
            }
          }
        );
      } else {
        output =
          "You are already connected to this circuit.";
      }
    } else {
      output = "Invalid path. Expecting /terminal/{name}";
    }

    return output;
  };

  handleError(errorContext, error) {
    console.error(error);
    this.setState({errorContext: errorContext, error: error});
  }

  handleJoinError(event, arg) {
    console.error(arg.error);
    if (this.terminalHandle.current && this.terminalHandle.current.pushErrorMessage) {
      this.terminalHandle.current.pushErrorMessage(arg.error);
    }
  }

  leaveTty = () => {
    this.resourcesController.leaveTerminalCircuit(
      this.state.terminalCircuit.circuitName
    );
    this.resourcesController.leaveExistingRoomWithRoomId(
      this.state.terminalCircuit.talkRoomId
    );

    this.setState((prevState) => {
      this.resourcesController.joinExistingRoomWithRoomId(
        prevState.baseCircuitShelf.talkRoomId
      );

      return {
        baseCircuitShelf: null,
        terminalCircuit: prevState.baseCircuitShelf,
        isBaseCircuit: true,
      };
    });
  };

  /**
   * renders the terminal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    if (this.state.error) {
      return UtilRenderer.getErrorPage(this.state.errorContext, this.state.error);
    }

    return (
      <div id="component" className="terminalLayout">
        <div id="wrapper" className="terminalContent">
          <TerminalContent
            me={this.state.me}
            ref={this.terminalHandle}
            terminalCircuit={this.state.terminalCircuit}
            commandManual={this.state.commandManual}
            isBaseCircuit={this.state.isBaseCircuit}
            joinTty={this.joinTty}
            leaveTty={this.leaveTty}
          />
        </div>
      </div>
    );
  }
}
