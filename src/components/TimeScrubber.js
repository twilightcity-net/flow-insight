import React, { Component } from "react";
import { Divider, Grid, Input, Popup, Segment } from "semantic-ui-react";
import moment from "moment";

const {remote} = window.require("electron");
const electronLog = remote.require("electron-log");


//
// this component is the tab panel wrapper for the console content
//
export default class TimeScrubber extends Component {
  constructor(props) {
    super(props);
    this.date = new Date(2017, 3, 7);

    let dateObj = new Date();
    let dateStr = moment(dateObj).format("dddd, MMM Do, YYYY");

    this.state = {
      activeDate: dateStr,
      nowShowing: "Showing Latest Activity",
      showingDetails: "",
      activeTick: 90,
      activeMax: 90
    };
  }

  fromTickToDate(tickIndex) {
    let dateObj = new Date();
    let offset = this.state.activeMax - tickIndex;
    dateObj.setDate(dateObj.getDate() - offset);

    let dateStr = moment(dateObj).format("dddd, MMM Do, YYYY");
    return dateStr;
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentWillReceiveProps = (nextProps) => {
    this.log("TimeScrubber:: componentWillReceiveProps");

    this.log("activeSize = "+ nextProps.activeSize);
    this.log("activeIndex =" + nextProps.activeIndex);
    this.log("activeEntry = "+ nextProps.activeEntry);

    // if (nextProps.activeEntry) {
    //
    //   this.setState({
    //     activeDate: nextProps.activeEntry.position,
    //     activeTick: nextProps.activeIndex,
    //     activeMax: nextProps.activeSize - 1,
    //     taskName: nextProps.activeEntry.taskName,
    //     taskDescription: nextProps.activeEntry.taskSummary
    //   });
    // }
  };

  /// called when the range slider changes
  handleRangeChange = e => {
    console.log("[ConsoleTabs] range change -> " + e.target.value);

    let newDate = this.fromTickToDate(e.target.value);
    this.setState({
      activeDate: newDate,
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
                          {this.state.nowShowing}
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
                    <Popup.Header>{this.state.nowShowing}</Popup.Header>
                    <Popup.Content>
                      {this.state.showingDetails}
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
