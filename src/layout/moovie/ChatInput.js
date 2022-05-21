import React, {Component} from "react";
import {TextArea} from "semantic-ui-react";

/**
 * this component is the wrapper for the always-on-top chat overlay panel
 */
export default class ChatInput extends Component {
  static sidebarWidth = "24em";

  /**
   * Initialize the child components of the layout
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[ChatInput]";
    this.state = {
      chatValue: ""
    };
    this.isEnterKeyPressed = false;
  }

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {
  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
  };

  handleKeyPress = (e) => {
    if (e.charCode === 13) {
      e.preventDefault();
      this.handleEnterKey();
    }
  };

  /**
   * handles our key press for when we use the enter or return keys. check out
   * text input for sql injection or if null or non characters. This sets a
   * boolean flag for enter key press and will toggle it when the request
   * from gridtime returns. This throttles the member to send 1 message.
   */
  handleEnterKey = () => {
    let text = this.state.chatValue;
    console.log("text = " + text);

    if (text === "" || this.isEnterKeyPressed) {
      return false;
    }

    this.isEnterKeyPressed = true;

    this.setState({
      chatValue: "",
    });

    console.log("about to call onEnterKey")
    this.props.onEnterKey(
      text,
      this.delegateEnterKeyCallback
    );
  };

  /**
   * called when gridtime has sent the talk message from pressing enter.
   */
  delegateEnterKeyCallback = () => {
    this.isEnterKeyPressed = false;
  };

  /**
   * When chat text is changed, update the state value
   */
  handleChangeText = (event) => {
    this.setState({
      chatValue: event.target.value,
    });
  };

  /**
   * renders the root console layout of the chat console view
   * @returns {*} - the JSX to render
   */
  render() {
    return (
     <TextArea
            id="moovieChatInput"
            className="chatInput"
            value={this.state.chatValue}
            // ref={this.chatInputRef}
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChangeText}
      />
    );
  }
}
