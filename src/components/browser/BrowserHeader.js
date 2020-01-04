import React, {Component} from "react";
import {Button, Dropdown, Grid, Icon, Input, Segment} from "semantic-ui-react";

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
      {key: 1, text: "Open", value: "Open"},
      {key: 2, text: "Close", value: "Close"},
      {key: 3, text: "Join", value: "Join"},
      {key: 4, text: "Leave", value: "Leave"}
    ];
    this.state = {
      currentActionValue: null,
      disableControls: false
    };
  }

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocusForInput = (e) => {
    document.getElementById("browserInput").classList.add("focused");
    document.getElementById("browserGoBtn").classList.add("focused");
  };

  /**
   * clear all of the highlights to the fields on any element blur.. called by all
   * form element inputs
   * @param e
   */
  handleBlurForInput = (e) => {
    document.getElementById("browserInput").classList.remove("focused");
    document.getElementById("browserGoBtn").classList.remove("focused");
  };

  getLocation = () => {
    return this.props.location.toLowerCase();
  };

  /**
   * called when a project is selected in dropdown
   * @param e
   * @param value
   */
  handleChangeForAction = (e, {value}) => {
    this.setState({
      currentActionValue: value
    });
  };

  getActionDropdown() {
    return (
      <Dropdown
        disabled={this.state.disableControls}
        className="browserAction"
        id="browserActionInput"
        placeholder="Choose Action"
        defaultValue={this.optionsActions[0].value}
        selection
        options={this.optionsActions}
        onChange={this.handleChangeForAction}
      />
    );
  }

  getBrowserBackBtn() {
    return (
      <Button className="browserBack">
        <Icon name="backward"/>
      </Button>
    );
  }

  getBrowserForwardBtn() {
    return (
      <Button className="browserForward">
        <Icon name="forward"/>
      </Button>
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
        value={this.getLocation()}
        onFocus={this.handleFocusForInput}
        onBlur={this.handleBlurForInput}
        placeholder={"Where do you want to go today?"}
        action={
          <Button
            color="violet"
            className="browserGo"
            id="browserGoBtn"
          >
            <Icon name="play"/>
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
                <Grid.Column width={1} id="browserBackCell">
                  {this.getBrowserBackBtn()}
                </Grid.Column>
                <Grid.Column width={1} id="browserForwardCell">
                  {this.getBrowserForwardBtn()}
                </Grid.Column>
                <Grid.Column width={2} id="browserActionCell">
                  {this.getActionDropdown()}
                </Grid.Column>
                <Grid.Column width={10} id="browserInputCell">
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
