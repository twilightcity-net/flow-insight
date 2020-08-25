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
        description:
          "Display about information for this shell",
        usage: "about",
        fn: () => {
          return "Torchie Shell // DreamScale © 2020 // Author: Zoe@DreamScale.io";
        }
      },
      version: {
        description:
          "Display version information for this shell",
        usage: "version",
        fn: () => {
          return "v.Psyki_0.5.3";
        }
      },
      whoami: {
        description: "Who am i really?.",
        usage: "whoami <string>",
        fn: function() {
          return `Only the white rabbit knows?`;
        }
      },
      yoda: {
        description: "Receive the gift of Yoda's wisdom",
        usage: "yoda",
        fn: function() {
          return TerminalContent.doYoda();
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
          "Last login: " +
            moment(new Date()).format(
              "MMMM Do YYYY, h:mm:ss a"
            ),
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

  static doYoda() {
    let doOr = (10 * Math.random()).toFixed(0),
      doNot = (10 * Math.random()) % 2 > 1,
      thereIsNoTry = [
        "Do or do not. There is no try.",
        "You must unlearn what you have learned.",
        "Named must be your fear before banish it you can.",
        "Fear is the path to the dark side.",
        "That is why you fail.",
        "The greatest teacher, failure is.",
        "Pass on what you have learned.",
        "Now I know there is something strong than fear — far stronger.",
        "Don't underestimate the Force.",
        "For my ally is the Force, and a powerful ally it is."
      ];

    let yodaSays = "";

    if (doNot) {
      yodaSays = thereIsNoTry[doOr];
    } else {
      yodaSays = "There is no try, only Do again.";
    }

    return yodaSays;
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
