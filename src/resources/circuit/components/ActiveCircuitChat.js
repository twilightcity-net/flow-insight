import React, { Component } from "react";
import { Icon, Image, Input, Menu, Segment } from "semantic-ui-react";

/**
 * This class is used to render the active circuit feed in the console view
 */
export default class ActiveCircuitFeed extends Component {
  /**
   * builds the active circuit chat component for the circuit feed
   * @param props
   */
  constructor(props) {
    super(props);
    this.imageEmojiSrc = "./assets/images/emoji_cool.png";
  }

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

  handleClickControls = (e, { name }) => {
    console.log("clicked on -> " + name);
  };

  handleOnChangeChatInput = (e, { value }) => {
    console.log(value);
    let textEl = document.getElementById("activeCircuitChatText");
    textEl.innerHTML += value;
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
          <div id="activeCircuitChatContainer" className="text-formatted">
            <span id="activeCircuitChatText" className="chat-text" />
            <span id="activeCircuitChatCursor" className="chat-cursor">
              |
            </span>
            <span>
              <Input
                id="activeCircuitChatInput"
                className="chat-input"
                transparent
                value=""
                onFocus={this.focusChat}
                onBlur={this.blurChat}
                onChange={this.handleOnChangeChatInput}
              />
            </span>
          </div>
        </Segment>
      </div>
    );
  }
}
