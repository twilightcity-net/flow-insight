import React, { Component, createRef } from "react";
import {
  Icon,
  Image,
  Menu,
  Segment,
  TextArea,
} from "semantic-ui-react";

/**
 * This class is used to render the active circuit feed in the console view
 */
export default class ActiveCircuitChat extends Component {
  /**
   * builds the active circuit chat component for the circuit feed
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuitChat]";
    this.imageEmojiSrc = "./assets/images/emoji_cool.png";
    this.chatInputRef = createRef();
    this.keyArray = [];
    this.isFocused = false;
    this.isMouseDown = false;
    this.isEnterKeyPressed = false;
    this.state = {
      chatValue: "",
    };
  }

  /**
   * functional handler which focuses our input field
   */
  focusChat = () => {
    this.isFocused = true;

    document
      .getElementById("activeCircuitChatContainer")
      .classList.add("focused");
  };

  /**
   * functional handler which blurs our input field
   */
  blurChat = () => {
    if (this.isFocused) {
      this.isFocused = false;

      document
        .getElementById("activeCircuitChatContainer")
        .classList.remove("focused");
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
   * click handler for our text controls of the component
   * @param e
   * @param name
   */
  handleClickControls = (e, { name }) => {
    console.log(this.name + " clicked on -> " + name);
  };

  /**
   * handles the user action of clicking on the text field component (this).
   */
  handleOnClickChat = () => {
    if (!this.isMouseDown) {
      this.chatInputRef.current.focus();
    }
  };

  /**
   * toggles the mouse button down boolean flag property
   */
  handleOnMouseDown = () => {
    this.isMouseDown = true;
  };

  /**
   * toggles the mouse button down boolean flag property
   */
  handleOnMouseUp = () => {
    this.isMouseDown = false;
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
   * When enter key is pressed, clear the chat and submit
   * @param e
   */
  handleKeyPress = (e) => {
    if (e.charCode === 13) {
      e.preventDefault();
      this.handleEnterKey();
    }
  };

  /**
   * renders the active circuit chat panel for the feed
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="activeCircuitChat">
        <Segment inverted>
          <Menu
            className="controls"
            inverted
            icon
            compact
            borderless
          >
            <Menu.Item
              name="font-color"
              onClick={this.handleClickControls}
            >
              <Icon name="font" />
            </Menu.Item>
            <Menu.Item
              name="font-bgColor"
              onClick={this.handleClickControls}
            >
              <Icon
                bordered
                inverted
                color="violet"
                name="font"
              />
            </Menu.Item>
            <Menu.Item
              name="font-smaller"
              onClick={this.handleClickControls}
            >
              <Icon.Group>
                <Icon name="font" />
                <Icon name="angle double down" />
              </Icon.Group>
            </Menu.Item>
            <Menu.Item
              name="font-medium"
              onClick={this.handleClickControls}
            >
              <Icon name="font" />
            </Menu.Item>
            <Menu.Item
              name="font-larger"
              onClick={this.handleClickControls}
            >
              <Icon.Group>
                <Icon name="font" />
                <Icon name="angle double up" />
              </Icon.Group>
            </Menu.Item>
            <Menu.Item
              name="font-bold"
              onClick={this.handleClickControls}
            >
              <Icon name="bold" />
            </Menu.Item>
            <Menu.Item
              name="font-italic"
              onClick={this.handleClickControls}
            >
              <Icon name="italic" />
            </Menu.Item>
            <Menu.Item
              name="font-underline"
              onClick={this.handleClickControls}
            >
              <Icon name="underline" />
            </Menu.Item>
            <Menu.Item
              name="font-link"
              onClick={this.handleClickControls}
            >
              link
            </Menu.Item>
            <Menu.Item
              name="emoji"
              onClick={this.handleClickControls}
            >
              <Image
                src={this.imageEmojiSrc}
                verticalAlign="top"
              />
            </Menu.Item>
          </Menu>
          <div
            id="activeCircuitChatContainer"
            className="text-formatted"
            onClick={this.handleOnClickChat}
            onMouseDown={this.handleOnMouseDown}
            onMouseUp={this.handleOnMouseUp}
          >
            <TextArea
              id="activeCircuitChatText"
              className="chat-text"
              value={this.state.chatValue}
              ref={this.chatInputRef}
              onFocus={this.focusChat}
              onBlur={this.blurChat}
              onKeyPress={this.handleKeyPress}
              onChange={this.handleChangeText}
            />
          </div>
        </Segment>
      </div>
    );
  }
}
