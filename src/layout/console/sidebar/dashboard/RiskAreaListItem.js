import React, { Component } from "react";
import { List, Popup } from "semantic-ui-react";

export default class RiskAreaListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleClick = () => {
    this.props.onItemClick(this.props.id);
  };

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let popupContent = (
      <div>
        <i>{this.props.tipInstruction}</i>
      </div>
    );

    return (
      <Popup
        trigger={trigger}
        className="circuitPopup chunkTitle"
        content={popupContent}
        position="right center"
        inverted
        hideOnScroll
      />
    );
  }

  render() {
    return this.getPopupContent(
      <List.Item
        className={this.props.active? "active" : ""}
        key={this.props.id}
        onClick={this.handleClick}
      >
        <List.Content>
          <List.Header>{this.props.title}</List.Header>
          <i className="name">{this.props.description}</i>
        </List.Content>
      </List.Item>
    );
  }
}
