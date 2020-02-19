import React, {Component, createRef} from "react";
import {Icon, Image, Input, Menu, Segment} from "semantic-ui-react";

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
  }

  getChatTextEl = () => {
    return document.getElementById("activeCircuitChatText");
  };

  focusChat = () => {
    document
    .getElementById("activeCircuitChatContainer")
    .classList.add("focused");
  };

  blurChat = () => {
    document
    .getElementById("activeCircuitChatContainer")
    .classList.remove("focused");
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

  isValidKey = kc => {
    return kc > 31 &&
      kc !== 91 &&
      kc !== 93 &&
      kc !== 45 &&
      kc !== 35 &&
      kc !== 36 &&
      kc !== 33 &&
      kc !== 34 &&
      kc !== 37 &&
      kc !== 39 &&
      kc !== 38 &&
      kc !== 40 &&
      kc !== 124 &&
      (kc < 112 ||
      kc  > 124);
  };

  handleEnterKey = () => {
    console.log(this.name + " post to server and clear box");
  };

  handleClickControls = (e, {name}) => {
    console.log(this.name + " clicked on -> " + name);
  };

  handleOnClickChatContainer = () => {
    this.chatInputRef.current.focus();
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

  /**
   * renders the active circuit chat panel for the feed
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="activeCircuitChat">
        <Segment inverted>
          <Menu className="controls" inverted icon compact borderless fluid>
            <Menu.Item name="font-color" onClick={this.handleClickControls}>
              <Icon name="font"/>
            </Menu.Item>
            <Menu.Item name="font-bgColor" onClick={this.handleClickControls}>
              <Icon bordered inverted color="violet" name="font"/>
            </Menu.Item>
            <Menu.Item name="font-smaller" onClick={this.handleClickControls}>
              <Icon.Group>
                <Icon name="font"/>
                <Icon name="angle double down"/>
              </Icon.Group>
            </Menu.Item>
            <Menu.Item name="font-medium" onClick={this.handleClickControls}>
              <Icon name="font"/>
            </Menu.Item>
            <Menu.Item name="font-larger" onClick={this.handleClickControls}>
              <Icon.Group>
                <Icon name="font"/>
                <Icon name="angle double up"/>
              </Icon.Group>
            </Menu.Item>
            <Menu.Item name="font-bold" onClick={this.handleClickControls}>
              <Icon name="bold"/>
            </Menu.Item>
            <Menu.Item name="font-italic" onClick={this.handleClickControls}>
              <Icon name="italic"/>
            </Menu.Item>
            <Menu.Item name="font-underline" onClick={this.handleClickControls}>
              <Icon name="underline"/>
            </Menu.Item>
            <Menu.Item name="font-link" onClick={this.handleClickControls}>
              link
            </Menu.Item>
            <Menu.Item name="emoji" onClick={this.handleClickControls}>
              <Image src={this.imageEmojiSrc} verticalAlign="top"/>
            </Menu.Item>
          </Menu>
          <div
            id="activeCircuitChatContainer"
            className="text-formatted"
            onClick={this.handleOnClickChatContainer}
          >
            <span id="activeCircuitChatText" className="chat-text"/>
            <span id="activeCircuitChatCursor" className="chat-cursor">
              |
            </span>
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
