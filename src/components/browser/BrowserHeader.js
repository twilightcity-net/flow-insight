import React, { Component } from "react";
import { Button, Dropdown, Icon, Input, Segment } from "semantic-ui-react";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class BrowserHeader extends Component {
  /**
   * the constructor for the array of journal items to display
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.name = "[BrowserHeader]";
    this.state = {
      disableControls: false
    };
  }

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocusForInput = e => {
    document.getElementById("browserInput").classList.add("focused");
    document.getElementById("browserGoInput").classList.add("focused");
  };

  /**
   * clear all of the highlights to the fields on any element blur.. called by all
   * form element inputs
   * @param e
   */
  handleBlurForInput = e => {
    document.getElementById("browserInput").classList.remove("focused");
    document.getElementById("browserGoInput").classList.remove("focused");
  };

  getLocation = () => {
    return this.props.location.toLowerCase();
  };

  /**
   * renders the journal items component from array in the console view
   * @returns {*} - the JSX to render for the journal header
   */
  render() {
    const options = [
      { key: 1, text: "Open", value: "Open" },
      { key: 2, text: "Close", value: "Close" },
      { key: 3, text: "Join", value: "Join" },
      { key: 4, text: "Leave", value: "Leave" }
    ];
    return (
      <div id="component" className="browserHeader">
        <Segment inverted>
          <div>
            <Input
              disabled={this.state.disableControls}
              id="browserInput"
              className="browserText"
              fluid
              inverted
              value={this.getLocation()}
              // value={this.state.currentIntentionValue}
              onFocus={this.handleFocusForInput}
              onBlur={this.handleBlurForInput}
              // onKeyPress={this.handleKeyPressForIntention}
              // onChange={this.handleChangeForIntention}
              placeholder={this.getLocation()}
            >
              <Button className={"browserBack"}>
                <Icon name="backward" />
              </Button>
              <Button className={"browserForward"}>
                <Icon name="forward" />
              </Button>
              <Dropdown options={options} selection defaultValue />
              <input />
              <Button
                color="violet"
                className={"browserGo"}
                id={"browserGoInput"}
              >
                Go >
              </Button>
            </Input>
          </div>
        </Segment>
      </div>
    );
  }
}
