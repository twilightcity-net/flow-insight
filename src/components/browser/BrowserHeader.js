import React, { Component } from "react";
import {
  Button,
  Dropdown,
  Grid,
  Icon,
  Input,
  Segment
} from "semantic-ui-react";

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
    this.optionsActions = [
      { key: 1, text: "Open", value: "Open" },
      { key: 2, text: "Close", value: "Close" },
      { key: 3, text: "Join", value: "Join" },
      { key: 4, text: "Leave", value: "Leave" }
    ];
    this.state = {
      disableControls: false
    };
  }

  componentDidMount() {
    console.log(this.props);
  }

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocus = e => {
    document.getElementById("browserAction").classList.add("focused");
    document.getElementById("browserInput").classList.add("focused");
    document.getElementById("browserGo").classList.add("focused");
  };

  /**
   * clear all of the highlights to the fields on any element blur.. called by all
   * form element inputs
   * @param e
   */
  handleBlur = e => {
    document.getElementById("browserAction").classList.remove("focused");
    document.getElementById("browserInput").classList.remove("focused");
    document.getElementById("browserGo").classList.remove("focused");
  };

  getLocation = () => {
    return this.props.location.toLowerCase();
  };

  /**
   * works the same as the click for create handler.. see above ^
   * @param e
   */
  handleKeyPressForInput = e => {
    if (e.charCode === 13) {
      console.log("load this resource into view");
    }
  };

  handleClickForGo = () => {
    console.log("load this resource into view");
  };

  getActionDropdown() {
    return (
      <Dropdown
        disabled={this.state.disableControls}
        className="browserAction"
        id="browserAction"
        placeholder="Choose Action"
        defaultValue={this.optionsActions[0].value}
        selection
        options={this.optionsActions}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />
    );
  }

  getBrowserInput() {
    return (
      <Input
        disabled={this.state.disableControls}
        id="browserInput"
        className="browserInput"
        fluid
        inverted
        placeholder={"Where do you want to go today?"}
        value={this.props.location.toLowerCase()}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyPress={this.handleKeyPressForInput}
        action={
          <Button
            color="violet"
            className="browserGo"
            id="browserGo"
            onClick={this.handleClickForGo}
          >
            <Icon name="play" />
          </Button>
        }
      />
    );
  }

  /**
   * renders the journal items component from array in the console view
   * @returns {*} - the JSX to render for the journal header
   */
  render() {
    return (
      <div id="component" className="browserHeader">
        <Segment.Group>
          <Segment inverted>
            <Grid columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column width={2} id="browserActionCell">
                  {this.getActionDropdown()}
                </Grid.Column>
                <Grid.Column width={14} id="browserInputCell">
                  {this.getBrowserInput()}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
