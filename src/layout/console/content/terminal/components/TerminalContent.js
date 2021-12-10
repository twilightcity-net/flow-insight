import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import Terminal from "react-console-emulator";
import {BrowserRequestFactory} from "../../../../../controllers/BrowserRequestFactory";
import {RendererControllerFactory} from "../../../../../controllers/RendererControllerFactory";
import {TerminalClient} from "../../../../../clients/TerminalClient";
import {RendererEventFactory} from "../../../../../events/RendererEventFactory";

/**
 * this component is the tab panel wrapper for the terminal content
 * @copyright Twilight City, Inc. 2021©®™√
 */
export default class TerminalContent extends Component {
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
      promptLabel: "fervie>",
      subshell: null,
      locked : false
    };
    this.state.commands = {}
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.commandManual !== null && prevProps.commandManual === null) {

      let allCommands = {
        ...this.getDefaultTopShellCommands(),
        ...this.getTopShellCommands()
      };

      this.setState({commands: allCommands});

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

    if (this.props.terminalCircuit && (arg.uri === this.props.terminalCircuit.talkRoomId)) {
      //message for this terminal circuit

       let output = arg.data;

       if (output.serializedDisplayString) {
         this.terminal.current.pushToStdout(arg.data.serializedDisplayString);
         this.terminal.current.scrollToBottom();
       }
    }
  };


  getDefaultTopShellCommands() {
    return {
      help: {
        description: "Show help from server command manual",
        usage: "help",
        fn: () => {
          return this.getShellOptionHelp();
        }
      },
      clear: {
        description: "Clear the terminal screen",
        fn: () => {
          this.terminal.current.clearStdout();
          return "";
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
        },
      },
    };
  }

  getShellOptionHelp() {
    let help = "Enter the name of a type of activity, to create a subshell that helps you with related tasks.\n\n";
    if (this.props.commandManual) {
      let activityContexts = this.props.commandManual.activityContexts;
      for (let i = 0; i < activityContexts.length; i++) {
         help += activityContexts[i].context.toLowerCase().padEnd(10) + " :: "+activityContexts[i].description + "\n";
      }
    }
    return help;
  }

  getSubshellCommands(subshellName) {

    let commands = {};

    if (this.props.commandManual) {
      let manualPage = this.props.commandManual.manualPagesByActivityContext[subshellName.toUpperCase()];

      for (let i = 0; i < manualPage.commandDescriptors.length; i++) {
        let commandDescriptor = manualPage.commandDescriptors[i];
        let command = commandDescriptor.command.toLowerCase();
        commands[command] = {
          fn: (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) => {

            let argArray = this.createArgArray(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);

            TerminalClient.runCommand(
              this.props.terminalCircuit.circuitName,
              {command: command.toUpperCase(), args: argArray}, this,
              (arg) => {
                  //display errors if we get back an error, we wont get a talk message
                  if (arg.error) {

                    this.terminal.current.pushToStdout(arg.error);
                    this.terminal.current.scrollToBottom();
                  }
              });
          }
        }
      }
    }

    return commands;
  }

  createArgArray(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
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
    let help = "Type 'help <command>' to open manual page details for the below commands.\n\n";

    if (this.props.commandManual) {
      let manualPage = this.props.commandManual.manualPagesByActivityContext[subshellName.toUpperCase()];

      for (let i = 0; i < manualPage.commandDescriptors.length; i++) {
        help += manualPage.commandDescriptors[i].command.toLowerCase().padEnd(10) + " :: "+ manualPage.commandDescriptors[i].description + "\n";
      }
    }
    return help;
  }

  getSubshellSpecificOptionHelp(subshellName, commandName) {
    let commandDescriptor = this.findCommandDescriptor(subshellName, commandName);

    let help = "";

    if (commandDescriptor) {
      help = "Command: "+commandDescriptor.command;
      help += "\nDescription: "+commandDescriptor.description;

      for (let i = 0; i < commandDescriptor.terminalRoutes.length; i++) {
        let route = commandDescriptor.terminalRoutes[i];
        help += "\n\nUsage: "+commandName.toLowerCase() + " "+ route.argsTemplate;

        for (const [option, description] of Object.entries(route.optionsHelp)) {
          help += "\nOption: "+("{" + option + "}").padEnd(10)+" :: " + description;
        }

      }
    } else {
       help = "Command '"+commandName+"' not found!";
    }

    return help;
  }

  findCommandDescriptor(subshellName, commandName) {
    if (this.props.commandManual) {
      let manualPage = this.props.commandManual.manualPagesByActivityContext[subshellName.toUpperCase()];

      for (let i = 0; i < manualPage.commandDescriptors.length; i++) {
        if ( manualPage.commandDescriptors[i].command.toUpperCase() === commandName.toUpperCase()) {
          return manualPage.commandDescriptors[i];
        }
      }
    }

    return null;

  }

  getDefaultSubShellCommands(subshellName) {
    return {
      help: {
        description: "Attempt to override the help",
        usage: "help",
        fn: (optionalCmd) => {
          if (optionalCmd) {
            return this.getSubshellSpecificOptionHelp(subshellName, optionalCmd);
          } else {
            return this.getSubshellOptionHelp(subshellName);
          }
        }
      },
      clear: {
        description: "Clear the terminal screen",
        fn: () => {
          this.terminal.current.clearStdout();
          return "";
        }
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
      let activityContexts = this.props.commandManual.activityContexts;
      for (let i = 0; i < activityContexts.length; i++) {
        let subshellName = activityContexts[i].context.toLowerCase();
        subshellCommands[subshellName] = {
          fn: () => {
             this.startSubshell(subshellName);
          }
        };
      }
    }

    return subshellCommands;
  }

  startSubshell(subshellName) {
    console.log("starting shell: "+subshellName);

    let subshellCommands = {
      ...this.getDefaultSubShellCommands(subshellName),
      ...this.getSubshellCommands(subshellName)
    };

    this.setState({
      subshell: subshellName,
      promptLabel: "fervie/" + subshellName + ">",
      commands: subshellCommands
    });
  }

  exitSubshell() {
    let allCommands = {
      ...this.getDefaultTopShellCommands(),
      ...this.getTopShellCommands()
    };

    this.setState({
      subshell: null,
      promptLabel: "fervie>",
      commands: allCommands
    });
  }

  getTerminalContent() {

    let welcome = "";
    if (this.props.terminalCircuit) {
      welcome = "This is Fervie Shell, running on "+this.props.terminalCircuit.url +"\n" +
        "For more information on commands, type 'help', or 'exit' to exit.";

      return (
        <Terminal
          ref={this.terminal}
          commands={this.state.commands}
          welcomeMessage={[welcome,
            "~",
          ]}
          styleEchoBack={"labelOnly"}
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
          promptLabelStyle={{
            color: "green",
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
      return <div></div>
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
