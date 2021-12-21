import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import Terminal from "react-console-emulator";
import { BrowserRequestFactory } from "../../../../../controllers/BrowserRequestFactory";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import { TerminalClient } from "../../../../../clients/TerminalClient";
import { RendererEventFactory } from "../../../../../events/RendererEventFactory";

/**
 * this component is the tab panel wrapper for the terminal content
 * @copyright Twilight City, Inc. 2021©®™√
 */
export default class TerminalContent extends Component {
  /**
   * this is the name of the meta property field which the talk message uses
   * to store the value of the user whom made the request typically.
   * @type {string}
   */
  static fromUserNameMetaPropsStr = "from.username";

  /**
   * builds the Terminal Content component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TerminalContent]";
    this.terminal = React.createRef();
    this.browserController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.LAYOUT_BROWSER,
        this
      );

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.state = {
      baseConnectPath: "",
      promptLabel: "fervie>",
      subshell: null,
      locked: false,
    };
    this.state.commands = {};
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.terminalCircuit &&
      prevProps.terminalCircuit &&
      this.props.terminalCircuit.circuitName !==
        prevProps.terminalCircuit.circuitName
    ) {
      //circuit connection changed

      this.configShellCommandsAndPrompt(null);
    }

    if (
      this.props.commandManual !== null &&
      prevProps.commandManual === null
    ) {
      let allCommands = {
        ...this.getDefaultTopShellCommands(),
        ...this.getTopShellCommands(),
        ...this.getAllSubshellCommands(),
        ...this.getTtyCommands(),
      };

      this.setState({ commands: allCommands });
    }
  }

  configShellCommandsAndPrompt(subshell) {
    let baseConnectPath = "";
    if (!this.props.isBaseCircuit) {
      baseConnectPath =
        this.props.me.username +
        "@terminal/" +
        this.props.terminalCircuit.circuitName +
        "::";
    }

    let prompt = "";
    let commands = [];

    if (subshell) {
      prompt = baseConnectPath + "fervie/" + subshell + ">";
      commands = {
        ...this.getDefaultSubShellCommands(subshell),
        ...this.getAllSubshellCommands(),
      };
    } else {
      prompt = baseConnectPath + "fervie>";
      commands = {
        ...this.getDefaultTopShellCommands(),
        ...this.getTopShellCommands(),
        ...this.getAllSubshellCommands(),
        ...this.getTtyCommands(),
      };
    }

    this.setState({
      baseConnectPath: baseConnectPath,
      subshell: subshell,
      promptLabel: prompt,
      commands: commands,
    });
  }

  pushTalkMessageHistory(messages) {
    for (let i = 0; i < messages.length; i++) {
      let messageFromUsername =
        this.getUsernameFromMetaProps(
          messages[i].metaProps
        );

      this.pushTalkMessage(
        messageFromUsername,
        messages[i]
      );
    }
    this.terminal.current.scrollToBottom();
  }

  pushErrorMessage(errorMsg) {
    let msg = (
      <span className={"errorText"}>{errorMsg}</span>
    );

    this.terminal.current.pushToStdout(msg);
    this.terminal.current.scrollToBottom();
  }

  getTtyCommands() {
    if (this.props.isBaseCircuit) {
      return {
        tty: {
          description: "List available ttys to connect to",
          fn: () => {
            TerminalClient.getConnectableTtys(
              this,
              (arg) => {
                if (arg.error) {
                  this.pushErrorMessage(arg.error);
                } else {
                  let output = arg.data.resultString;
                  output +=
                    "\nType 'join {ttyLink}' to join";

                  this.terminal.current.pushToStdout(
                    output
                  );
                }
                this.terminal.current.scrollToBottom();
              }
            );
            return "";
          },
        },
        join: {
          fn: (ttyLink) => {
            let output = "";
            if (ttyLink) {
              output = this.props.joinTty(ttyLink);
            } else {
              output = "Usage: join {ttyLink}";
            }
            return output;
          },
        },
      };
    } else {
      return {};
    }
  }

  /**
   * event handler for talk messages. This is called everytime we receive a new talk
   * message over the event bus. Make sure to check that this is our terminal circuit
   * since we will get events for everything
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    if (
      this.props.terminalCircuit &&
      arg.uri === this.props.terminalCircuit.talkRoomId
    ) {
      //message for this terminal circuit

      let messageFromUsername =
        this.getUsernameFromMetaProps(arg.metaProps);

      if (messageFromUsername !== this.props.me.username) {
        if (
          arg.messageType ===
            TerminalClient.MessageTypes
              .ROOM_MEMBER_STATUS_EVENT ||
          arg.messageType ===
            TerminalClient.MessageTypes.TERMINAL_CMD_RESULT
        ) {
          this.pushTalkMessage(messageFromUsername, arg);
          this.terminal.current.scrollToBottom();
        } else if (
          arg.messageType ===
          TerminalClient.MessageTypes
            .TERMINAL_CIRCUIT_CLOSED
        ) {
          this.exitJoinedCircuit();
        } else {
          console.log(
            "Unknown talk message type!  Ignoring... " +
              arg.messageType
          );
        }
      } else if (arg.data.resultString) {
        this.terminal.current.pushToStdout(
          arg.data.resultString
        );
        this.terminal.current.scrollToBottom();
      }
    }
  };

  pushTalkMessage(messageFromUsername, arg) {
    if (
      arg.messageType ===
      TerminalClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT
    ) {
      let msg = "";
      if (arg.data.statusEvent === "ROOM_MEMBER_JOIN") {
        msg = (
          <span className={"userSharedText"}>
            {messageFromUsername + " joined the circuit."}
          </span>
        );
      } else {
        msg = (
          <span className={"userSharedText"}>
            {messageFromUsername + " left."}
          </span>
        );
      }

      this.terminal.current.pushToStdout(msg, true);
    } else if (
      arg.messageType ===
      TerminalClient.MessageTypes.TERMINAL_CMD_RESULT
    ) {
      let echoMsg = (
        <div>
          <span className={"sharedTerminalPrompt"}>
            {arg.data.commandFrom + ">"}{" "}
          </span>
          <span className={"sharedTerminalInput"}>
            {arg.data.commandExecuted}
          </span>
        </div>
      );

      this.terminal.current.pushToStdout(echoMsg, true);
      if (arg.data.resultString) {
        this.terminal.current.pushToStdout(
          arg.data.resultString
        );
      }
    }
  }

  exitJoinedCircuit() {
    if (!this.props.isBaseCircuit) {
      let msg = (
        <span className={"userSharedText"}>
          {"Circuit terminated by owner."}
        </span>
      );

      this.terminal.current.pushToStdout(msg);
      this.terminal.current.scrollToBottom();

      this.props.leaveTty();
    }
  }

  /**
   * renders our username from the talk message's meta-prop which contains
   * the string of this.
   * @param metaProps
   * @returns {boolean|*}
   */
  getUsernameFromMetaProps(metaProps) {
    return (
      !!metaProps &&
      metaProps[TerminalContent.fromUserNameMetaPropsStr]
    );
  }

  getDefaultTopShellCommands() {
    return {
      help: {
        description: "Show help from server command manual",
        usage: "help",
        fn: () => {
          return this.getShellOptionHelp();
        },
      },
      clear: {
        description: "Clear the terminal screen",
        fn: () => {
          this.terminal.current.clearStdout();
          return "";
        },
      },
      exit: {
        description: "Exit the terminal of the shell",
        usage: "exit",
        fn: () => {
          if (this.props.isBaseCircuit) {
            let request =
              BrowserRequestFactory.createRequest(
                BrowserRequestFactory.Requests.JOURNAL,
                "me"
              );
            setTimeout(() => {
              this.browserController.makeRequest(request);
            }, 420);
            return "Goodbye...";
          } else {
            this.props.leaveTty();
          }
        },
      },
    };
  }

  getShellOptionHelp() {
    let help =
      "Enter one of the activity types below, to create a subshell that helps you with related tasks.\n\n";
    if (this.props.commandManual) {
      let activityContexts =
        this.props.commandManual.activityContexts;
      for (let i = 0; i < activityContexts.length; i++) {
        help +=
          activityContexts[i].context
            .toLowerCase()
            .padEnd(10) +
          " :: " +
          activityContexts[i].description +
          "\n";
      }
    }

    if (this.props.isBaseCircuit) {
      help +=
        "\nType 'tty' to show other terminal circuits on the network";
    }

    return help;
  }

  getAllSubshellCommands() {
    let commands = {};

    let uniqueCommands = new Set();

    for (
      let j = 0;
      j < this.props.commandManual.activityContexts.length;
      j++
    ) {
      let activity =
        this.props.commandManual.activityContexts[j]
          .context;
      let manualPage =
        this.props.commandManual
          .manualPagesByActivityContext[activity];

      for (
        let i = 0;
        i < manualPage.commandDescriptors.length;
        i++
      ) {
        let commandDescriptor =
          manualPage.commandDescriptors[i];
        let command =
          commandDescriptor.command.toLowerCase();

        uniqueCommands.add(command);
      }
    }

    uniqueCommands.forEach((command) => {
      commands[command] = {
        fn: (
          arg0,
          arg1,
          arg2,
          arg3,
          arg4,
          arg5,
          arg6,
          arg7,
          arg8,
          arg9
        ) => {
          let argArray = this.createArgArray(
            arg0,
            arg1,
            arg2,
            arg3,
            arg4,
            arg5,
            arg6,
            arg7,
            arg8,
            arg9
          );

          TerminalClient.runCommand(
            this.props.terminalCircuit.circuitName,
            {
              command: command.toUpperCase(),
              args: argArray,
            },
            this,
            (arg) => {
              //display errors if we get back an error, we wont get a talk message
              if (arg.error) {
                this.pushErrorMessage(arg.error);
              }
            }
          );
        },
      };
    });

    return commands;
  }

  getSubshellCommands(subshellName) {
    let commands = {};

    if (this.props.commandManual) {
      let manualPage =
        this.props.commandManual
          .manualPagesByActivityContext[
          subshellName.toUpperCase()
        ];

      for (
        let i = 0;
        i < manualPage.commandDescriptors.length;
        i++
      ) {
        let commandDescriptor =
          manualPage.commandDescriptors[i];
        let command =
          commandDescriptor.command.toLowerCase();
        commands[command] = {
          fn: (
            arg0,
            arg1,
            arg2,
            arg3,
            arg4,
            arg5,
            arg6,
            arg7,
            arg8,
            arg9
          ) => {
            let argArray = this.createArgArray(
              arg0,
              arg1,
              arg2,
              arg3,
              arg4,
              arg5,
              arg6,
              arg7,
              arg8,
              arg9
            );

            TerminalClient.runCommand(
              this.props.terminalCircuit.circuitName,
              {
                command: command.toUpperCase(),
                args: argArray,
              },
              this,
              (arg) => {
                //display errors if we get back an error, we wont get a talk message
                if (arg.error) {
                  this.pushErrorMessage(arg.error);
                }
              }
            );
          },
        };
      }
    }

    return commands;
  }

  createArgArray(
    arg0,
    arg1,
    arg2,
    arg3,
    arg4,
    arg5,
    arg6,
    arg7,
    arg8,
    arg9
  ) {
    let argArray = [];
    argArray = this.addToArrayIfNotNull(argArray, arg0);
    argArray = this.addToArrayIfNotNull(argArray, arg1);
    argArray = this.addToArrayIfNotNull(argArray, arg2);
    argArray = this.addToArrayIfNotNull(argArray, arg3);
    argArray = this.addToArrayIfNotNull(argArray, arg4);
    argArray = this.addToArrayIfNotNull(argArray, arg5);
    argArray = this.addToArrayIfNotNull(argArray, arg6);
    argArray = this.addToArrayIfNotNull(argArray, arg7);
    argArray = this.addToArrayIfNotNull(argArray, arg8);
    argArray = this.addToArrayIfNotNull(argArray, arg9);

    return argArray;
  }

  addToArrayIfNotNull(array, arg) {
    if (arg) {
      array.push(arg);
    }
    return array;
  }

  getSubshellOptionHelp(subshellName) {
    let help =
      "Type 'help <command>' to open manual page details for the below commands.\n\n";

    if (this.props.commandManual) {
      let manualPage =
        this.props.commandManual
          .manualPagesByActivityContext[
          subshellName.toUpperCase()
        ];

      for (
        let i = 0;
        i < manualPage.commandDescriptors.length;
        i++
      ) {
        help +=
          manualPage.commandDescriptors[i].command
            .toLowerCase()
            .padEnd(10) +
          " :: " +
          manualPage.commandDescriptors[i].description +
          "\n";
      }
    }
    return help;
  }

  getSubshellSpecificOptionHelp(subshellName, commandName) {
    let commandDescriptor = this.findCommandDescriptor(
      subshellName,
      commandName
    );

    let help = "";

    if (commandDescriptor) {
      help = "Command: " + commandDescriptor.command;
      help +=
        "\nDescription: " + commandDescriptor.description;

      for (
        let i = 0;
        i < commandDescriptor.terminalRoutes.length;
        i++
      ) {
        let route = commandDescriptor.terminalRoutes[i];
        help +=
          "\n\nUsage: " +
          commandName.toLowerCase() +
          " " +
          route.argsTemplate;

        for (const [option, description] of Object.entries(
          route.optionsHelp
        )) {
          help +=
            "\nOption: " +
            ("{" + option + "}").padEnd(10) +
            " :: " +
            description;
        }
      }
    } else {
      help = "Command '" + commandName + "' not found!";
    }

    return help;
  }

  findCommandDescriptor(subshellName, commandName) {
    if (this.props.commandManual) {
      let manualPage =
        this.props.commandManual
          .manualPagesByActivityContext[
          subshellName.toUpperCase()
        ];

      for (
        let i = 0;
        i < manualPage.commandDescriptors.length;
        i++
      ) {
        if (
          manualPage.commandDescriptors[
            i
          ].command.toUpperCase() ===
          commandName.toUpperCase()
        ) {
          return manualPage.commandDescriptors[i];
        }
      }
    }

    return null;
  }

  getDefaultSubShellCommands(subshellName) {
    return {
      help: {
        description:
          "Override the help with command manual help",
        usage: "help",
        fn: (optionalCmd) => {
          if (optionalCmd) {
            return this.getSubshellSpecificOptionHelp(
              subshellName,
              optionalCmd
            );
          } else {
            return this.getSubshellOptionHelp(subshellName);
          }
        },
      },
      clear: {
        description: "Clear the terminal screen",
        fn: () => {
          this.terminal.current.clearStdout();
          return "";
        },
      },
      exit: {
        description: "Exit the subshell",
        usage: "exit",
        fn: () => {
          this.exitSubshell();
          return "";
        },
      },
    };
  }

  getTopShellCommands() {
    let subshellCommands = {};

    if (this.props.commandManual) {
      let activityContexts =
        this.props.commandManual.activityContexts;
      for (let i = 0; i < activityContexts.length; i++) {
        let subshellName =
          activityContexts[i].context.toLowerCase();
        subshellCommands[subshellName] = {
          fn: () => {
            this.startSubshell(subshellName);
          },
        };
      }
    }

    return subshellCommands;
  }

  startSubshell(subshellName) {
    this.configShellCommandsAndPrompt(subshellName);
  }

  exitSubshell() {
    this.configShellCommandsAndPrompt(null);
  }

  getTerminalContent() {
    let welcome = "";
    if (this.props.terminalCircuit) {
      welcome =
        "This is Fervie Shell, running on " +
        this.props.terminalCircuit.url +
        "\n" +
        "For more information on commands, type 'help', or 'exit' to exit.";

      return (
        <Terminal
          ref={this.terminal}
          commands={this.state.commands}
          welcomeMessage={[welcome, "~"]}
          styleEchoBack={"fullInherit"}
          noNewlineParsing={true}
          noDefaults={true}
          promptLabel={this.state.promptLabel}
          autoFocus={true}
          dangerMode={false}
          messageStyle={{
            fontFamily: "monospace",
            whiteSpace: "pre",
          }}
          className="terminal"
          inputTextClassName="terminalInputText"
          promptLabelStyle={{
            color: "rgba(140, 110, 250, 0.96)",
            fontSize: "1rem",
            lineHeight: "1rem",
            fontWeight: "bolder",
            cursor: "normal",
          }}
          inputStyle={{
            color: "#d3d3d3",
            fontSize: "1rem",
            lineHeight: "1rem",
            fontWeight: "bolder",
            cursor: "default",
          }}
          contentStyle={{
            color: "#d3d3d3",
            fontSize: "1rem",
            lineHeight: "1rem",
            fontWeight: "normal",
          }}
        />
      );
    } else {
      return <div></div>;
    }
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
        "For my ally is the Force, and a powerful ally it is.",
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
          height: DimensionController.getFlowPanelHeight(),
        }}
      >
        {this.getTerminalContent()}
      </div>
    );
  }
}
