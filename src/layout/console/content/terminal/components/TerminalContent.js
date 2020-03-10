import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import Terminal from "react-console-emulator";
import moment from "moment";
import { BrowserRequestFactory } from "../../../../../controllers/BrowserRequestFactory";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";

/**
 * this component is the tab panel wrapper for the terminal content
 * @author ZoeDreams
 * @copyright DreamScale, Inc. 2020©®™√
 */
export default class TerminalContent extends Component {
  /**
   * builds the Terminal Content component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TerminalContent]";
    this.browserController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.LAYOUT_BROWSER,
      this
    );
    this.commands = {
      about: {
        description: "Display about information for this shell",
        usage: "about",
        fn: () => {
          return "Torchie Shell // DreamScale © 2020 // Author: Zoe@DreamScale.io";
        }
      },
      version: {
        description: "Display version information for this shell",
        usage: "version",
        fn: () => {
          return "v0.4.1 Higgly Heights";
        }
      },
      echo: {
        description: "Echo a passed string.",
        usage: "echo <string>",
        fn: function() {
          return `${Array.from(arguments).join(" ")}`;
        }
      },
      exit: {
        description: "Exit the terminal of the shell",
        usage: "exit",
        fn: () => {
          let request = BrowserRequestFactory.createRequest(
            BrowserRequestFactory.Requests.JOURNAL,
            "me"
          );
          setTimeout(() => {
            this.browserController.makeRequest(request);
          }, 420);
          return "Goodbye...";
        }
      }
    };
  }

  getTerminalContent() {
    return (
      <Terminal
        commands={this.commands}
        welcomeMessage={[
          "Last login: " + moment(new Date()).format("MMMM Do YYYY, h:mm:ss a"),
          "~"
        ]}
        promptLabel={"me@Pheonix~$"}
        autoFocus={true}
        dangerMode={true}
        style={{
          background: "none",
          fontSize: "0.420rem",
          lineHeight: "0.420rem",
          fontWeight: "bold",
          cursor: "default"
        }}
        promptLabelStyle={{
          color: "green",
          fontSize: "1rem",
          lineHeight: "1rem",
          fontWeight: "bolder",
          cursor: "default"
        }}
        inputStyle={{
          color: "#d3d3d3",
          fontSize: "1rem",
          lineHeight: "1rem",
          fontWeight: "bold",
          cursor: "default"
        }}
        contentStyle={{
          color: "#d3d3d3",
          fontSize: "1rem",
          lineHeight: "1rem",
          fontWeight: "bold"
        }}
      />
    );
  }

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (
      <div
        id="component"
        className="terminalContent"
        style={{
          height: DimensionController.getFlowPanelHeight()
        }}
      >
        {this.getTerminalContent()}
      </div>
    );
  }
}
