import React, { Component } from "react";
import { Divider, Grid, Input, Popup, Segment } from "semantic-ui-react";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");


//
// this component is the tab panel wrapper for the console content
//
export default class TimeScrubber extends Component {
  constructor(props) {
    super(props);
    this.date = new Date(2017, 3, 7);

    this.state = {
      activeDate: "",
      taskName: "",
      taskDescription: "",
      activeTick: 1,
      activeMax: 64
    };

  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentWillReceiveProps = (nextProps) => {
    this.log("TimeScrubber:: componentWillReceiveProps");

    this.log("activeSize = "+ nextProps.activeSize);
    this.log("activeIndex =" + nextProps.activeIndex);
    this.log("activeEntry = "+ nextProps.activeEntry);

    if (nextProps.activeEntry) {

      this.setState({
        activeDate: nextProps.activeEntry.position,
        activeTick: nextProps.activeIndex,
        activeMax: nextProps.activeSize - 1,
        taskName: nextProps.activeEntry.taskName,
        taskDescription: nextProps.activeEntry.taskSummary
      });
    }
  };

  /// called when the range slider changes
  handleRangeChange = e => {
    console.log("[ConsoleTabs] range change -> " + e.target.value);
    this.setState({
      activeTick: e.target.value
    });

    this.props.onChangeScrubPosition(e.target.value);
  };

  /// renders the time scrubber component of the console view
  render() {
    return (
      <div id="component" className="timeScrubber">
        <Segment.Group>
          <Segment inverted>
            <Grid textAlign="right" columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column width={12} className="scrubber">
                  <Input
                    type="range"
                    fluid
                    value={this.state.activeTick}
                    min={0}
                    max={this.state.activeMax}
                    onChange={this.handleRangeChange}
                  />
                </Grid.Column>

                <Grid.Column className="info">
                  <Popup
                    trigger={
                      <div>
                        <div className="title">
                          {this.state.taskDescription}
                        </div>
                        <div className="date">
                          {this.state.activeDate}
                        </div>
                      </div>
                    }
                    className="timeScrubber"
                    position="bottom right"
                    on="hover"
                    inverted
                    wide
                  >
                    <Popup.Header>{this.state.taskName}</Popup.Header>
                    <Popup.Content>
                      {this.state.taskDescription}
                      <Divider />
                      <i className="date">
                        {this.state.activeDate}
                      </i>
                    </Popup.Content>
                  </Popup>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
