import React, { Component, createRef } from "react";
import { Icon, Image, Input, Menu, Segment } from "semantic-ui-react";

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
  }

  getChatTextEl = () => {
    return document.getElementById("activeCircuitChatText");
  };

  focusChat = () => {
    this.isFocused = true;
    document
      .getElementById("activeCircuitChatContainer")
      .classList.add("focused");
  };

  blurChat = () => {
    if (this.isFocused) {
      this.isFocused = false;
      document
        .getElementById("activeCircuitChatContainer")
        .classList.remove("focused");
    }
  };

  addCharToText = (keyCode, key) => {
    let el = this.getChatTextEl();
    this.keyArray.push(keyCode);
    el.innerText += key;
  };

  delCharFromText = () => {
    let el = this.getChatTextEl();
    this.keyArray.pop();
    el.innerText = el.innerText.slice(0, -1);
  };

  isValidKey = key => {
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

  handleEnterKey = () => {
    console.log(this.name + " post to server and clear box");
  };

  handleClickControls = (e, { name }) => {
    console.log(this.name + " clicked on -> " + name);
  };

  handleOnClickChat = () => {
    if (!this.isMouseDown) {
      this.chatInputRef.current.focus();
    }
  };

  handleOnMouseEnter = () => {
    this.isSelecting = true;
  };

  handleOnMouseLeave = () => {
    this.isSelecting = false;
  };

  handleOnMouseDown = () => {
    console.log("down");
    this.isMouseDown = true;
  };

  handleOnMouseUp = () => {
    console.log("up");
    this.isMouseDown = false;
  };

  handleOnKeyDownChatInput = e => {
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

  getTextCursor() {
    return (
      <span id="activeCircuitChatCursor" className="chat-cursor">
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
          <Menu className="controls" inverted icon compact borderless>
            <Menu.Item name="font-color" onClick={this.handleClickControls}>
              <Icon name="font" />
            </Menu.Item>
            <Menu.Item name="font-bgColor" onClick={this.handleClickControls}>
              <Icon bordered inverted color="violet" name="font" />
            </Menu.Item>
            <Menu.Item name="font-smaller" onClick={this.handleClickControls}>
              <Icon.Group>
                <Icon name="font" />
                <Icon name="angle double down" />
              </Icon.Group>
            </Menu.Item>
            <Menu.Item name="font-medium" onClick={this.handleClickControls}>
              <Icon name="font" />
            </Menu.Item>
            <Menu.Item name="font-larger" onClick={this.handleClickControls}>
              <Icon.Group>
                <Icon name="font" />
                <Icon name="angle double up" />
              </Icon.Group>
            </Menu.Item>
            <Menu.Item name="font-bold" onClick={this.handleClickControls}>
              <Icon name="bold" />
            </Menu.Item>
            <Menu.Item name="font-italic" onClick={this.handleClickControls}>
              <Icon name="italic" />
            </Menu.Item>
            <Menu.Item name="font-underline" onClick={this.handleClickControls}>
              <Icon name="underline" />
            </Menu.Item>
            <Menu.Item name="font-link" onClick={this.handleClickControls}>
              link
            </Menu.Item>
            <Menu.Item name="emoji" onClick={this.handleClickControls}>
              <Image src={this.imageEmojiSrc} verticalAlign="top" />
            </Menu.Item>
          </Menu>
          <div
            id="activeCircuitChatContainer"
            className="text-formatted"
            onClick={this.handleOnClickChat}
            onMouseEnter={this.handleOnMouseEnter}
            onMouseLeave={this.handleOnMouseLeave}
            onMouseDown={this.handleOnMouseDown}
            onMouseUp={this.handleOnMouseUp}
          >
            <span id="activeCircuitChatText" className="chat-text" />
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
