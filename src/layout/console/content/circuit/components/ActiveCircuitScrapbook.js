import React, { Component } from "react";
import { Divider, Menu, Segment } from "semantic-ui-react";

/**
 * this class renders the active circuit scrapbook component into the console
 * view window
 */
export default class ActiveCircuitScrapbook extends Component {
  /**
   * builds the active circuit scrapbook component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuitScrapbook]";
  }

  /**
   * our click handler for our minimize button
   */
  handleClick = () => {
    this.props.hideScrapbook();
  };

  /**
   * renders the circuit scrapbook component
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="activeCircuitScrapbook">
        <Segment inverted>
          <Menu icon inverted fluid secondary>
            <Menu.Item header>Scrapbook</Menu.Item>
            <Menu.Item
              link
              position="right"
              icon="window minimize"
              onClick={this.handleClick}
            />
          </Menu>
          <Divider clearing fitted />
          <Segment className="scrapbookItemContainer" inverted>
            <i>No Item Selected</i>
          </Segment>
        </Segment>
      </div>
    );
  }
}
