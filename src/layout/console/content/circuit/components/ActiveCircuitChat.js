import React, { Component, createRef } from "react";
import {
  Icon,
  Image,
  Input,
  Menu,
  Segment,
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
  }

  /**
   * gets our chat text DOM element
   * @returns {HTMLElement}
   */
  getChatTextEl = () => {
    return document.getElementById("activeCircuitChatText");
  };

  /**
   * gets our chat text input bubble we type into
   * @returns {string}
   */
  getChatTextInnerTextStr = () => {
    return this.getChatTextEl().innerText;
  };

  /**
   * functional handler which focuses our input field
   */
  focusChat = () => {
    this.isFocused = true;

    document
      .getElementById("activeCircuitChatCursor")
      .classList.remove("cursor-hide");

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
        .getElementById("activeCircuitChatCursor")
        .classList.add("cursor-hide");

      document
        .getElementById("activeCircuitChatContainer")
        .classList.remove("focused");
    }
  };

  /**
   * adds a new character to our array and also the html DOM
   * @param keyCode
   * @param key
   */
  addCharToText = (keyCode, key) => {
    let el = this.getChatTextEl();
    this.keyArray.push(keyCode);
    el.innerText += key;
  };

  /**
   * removes the last or top character from our html and array
   */
  delCharFromText = () => {
    let el = this.getChatTextEl();
    this.keyArray.pop();
    el.innerText = el.innerText.slice(0, -1);
  };

  /**
   * checks to see if we have pressed a valid key, any key listed in here
   * will be escaped automatically. no exceptions, uses integers against
   * the current 256 character Unicode ASCII table
   * @param key
   * @returns {boolean|boolean}
   */
  isValidKey = (key) => {
    return (
      key > 31 &&
      key !== 91 &&
      key !== 93 &&
      key !== 45 &&
      key !== 35 &&
      key !== 36 &&
      key !== 33 &&
      key !== 34 &&
      key !== 37 &&
      key !== 39 &&
      key !== 38 &&
      key !== 40 &&
      key !== 124 &&
      (key < 112 || key > 124)
    );
  };

  /**
   * handles our key press for when we use the enter or return keys. check out
   * text input for sql injection or if null or non characters. This sets a
   * boolean flag for enter key press and will toggle it when the request
   * from gridtime returns. This throttles the member to send 1 message.
   */
  handleEnterKey = () => {
    let text = this.getChatTextInnerTextStr();

    if (text === "" || this.isEnterKeyPressed) {
      return false;
    }

    this.isEnterKeyPressed = true;
    this.clearInnerText();
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
   * clears our text from our chat text html element
   */
  clearInnerText = () => {
    let el = this.getChatTextEl();
    el.innerText = "";
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
   * listens for input from the semantic gui input control
   * @param e
   */
  handleOnKeyDownChatInput = (e) => {
    switch (e.keyCode) {
      case 8:
        this.delCharFromText();
        break;
      case 46:
        this.delCharFromText();
        break;
      case 13:
        this.handleEnterKey();
        break;
      default:
        if (this.isValidKey(e.keyCode)) {
          this.addCharToText(e.keyCode, e.key);
        }
        break;
    }
  };

  /**
   * gets our rendering of our text cursor that blinks
   * @returns {*}
   */
  getTextCursor() {
    return (
      <span
        id="activeCircuitChatCursor"
        className="chat-cursor"
      >
        |
      </span>
    );
  }

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
            <span
              id="activeCircuitChatText"
              className="chat-text"
            />
            {this.getTextCursor()}
            <span>
              <Input
                id="activeCircuitChatInput"
                className="chat-input"
                transparent
                value=""
                ref={this.chatInputRef}
                onFocus={this.focusChat}
                onBlur={this.blurChat}
                onKeyDown={this.handleOnKeyDownChatInput}
              />
            </span>
          </div>
        </Segment>
      </div>
    );
  }
}
