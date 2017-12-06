import React, { Component } from "react";
import { Grid, Menu, Icon, Input, Segment } from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class ConsoleTabs extends Component {
  constructor(props) {
    super(props);
    this.bounds = this.getBounds();
    this.activeItem = this.state = {
      activeItem: "journal"
    };
  }

  getBounds() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  state = {};

  handleRangeChange = e => {
    console.log("[ConsoleTabs] range change -> " + e.target.value);
  };

  handleMenuClick = (e, { name }) => {
    this.setState({ activeItem: name });
  };

  handleHideClick = (e, { name }) => {
    console.log("[ConsoleTabs] open hide window");
  };

  handleUndockClick = (e, { name }) => {
    console.log("[ConsoleTabs] open undock window");
  };

  handleSettingsClick = (e, { name }) => {
    console.log("[ConsoleTabs] open settings window");
  };

  /*
   * renders the tab component of the console view
   */
  render() {
    const { activeItem } = this.state;
    return (
      <div id="wrapper" className="consoleTabs">
        <div id="wrapper" className="content">
          <Segment.Group>
            <Segment inverted>
              <Grid columns={16}>
                <Grid.Column width={13} className="scrubber">
                  <Input
                    type="range"
                    fluid
                    max={256}
                    onChange={this.handleRangeChange}
                  />
                </Grid.Column>
                <Grid.Column width={3}>cell 2</Grid.Column>
              </Grid>
            </Segment>
          </Segment.Group>

          <div className="content">
            <Segment size="small" basic inverted>
              Te eum doming eirmod, nominati pertinacia argumentum ad his.
            </Segment>
            <Segment size="small" basic inverted>
              Pellentesque habitant morbi tristique senectus.
            </Segment>
            <Segment size="small" basic inverted>
              Eu quo homero blandit intellegebat. Incorrupte consequuntur mei
              id.
            </Segment>
            <Segment size="small" basic inverted>
              nominati quo argumentum tristique doming. homero senectus mei
              Pellentesque.
            </Segment>
            <Segment size="small" basic inverted>
              argumentum eirmod morbi Incorrupte intellegebat.
            </Segment>
            <Segment size="small" basic inverted>
              Eu quo homero blandit intellegebat. Incorrupte consequuntur mei
              id.
            </Segment>
          </div>

          <Segment.Group>
            <Segment inverted>
              <Grid>
                <Grid.Column width={4}>cell 1</Grid.Column>
                <Grid.Column width={9}>cell 2</Grid.Column>
                <Grid.Column width={3}>cell 3</Grid.Column>
              </Grid>
            </Segment>
          </Segment.Group>
        </div>
        <div id="wrapper" className="menu">
          <Menu size="tiny" inverted>
            <Menu.Item
              name="journal"
              color="violet"
              active={activeItem === "journal"}
              onClick={this.handleMenuClick}
            >
              <Icon name="book" size="large" />
              Journal
            </Menu.Item>
            <Menu.Item
              name="torchie"
              color="violet"
              active={activeItem === "torchie"}
              onClick={this.handleMenuClick}
            >
              <Icon name="heart" size="large" />
              Torchie
            </Menu.Item>
            <Menu.Item
              name="flow"
              color="violet"
              active={activeItem === "flow"}
              onClick={this.handleMenuClick}
            >
              <Icon name="random" size="large" />
              Flow
            </Menu.Item>
            <Menu.Menu position="right">
              <Menu.Item name="hide" onClick={this.handleHideClick}>
                <Icon name="toggle up" size="large" />
              </Menu.Item>
              <Menu.Item name="undock" onClick={this.handleUndockClick}>
                <Icon name="window restore" size="large" />
              </Menu.Item>
              <Menu.Item name="settings" onClick={this.handleSettingsClick}>
                <Icon name="settings" size="large" />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
        </div>
      </div>
    );
  }
}
