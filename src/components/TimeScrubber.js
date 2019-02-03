import React, { Component } from "react";
import { Divider, Grid, Input, Popup, Segment } from "semantic-ui-react";
import moment from "moment";

const { remote } = window.require("electron");
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
    let dateObj = this.fromTickToDateObj(tickIndex);
    let dateStr = moment(dateObj).format("dddd, MMM Do, YYYY");
    return dateStr;
  }

  fromTickToDateObj(tickIndex) {
    let dateObj = new Date();
    let offset = this.state.activeMax - tickIndex;
    dateObj.setDate(dateObj.getDate() - offset);

    return dateObj;
  }

  fromDateToTick(dateObj) {
    let latestDate = new Date();

    var start = moment(dateObj);
    var end = moment(latestDate);
    let ticks = end.diff(start, "days");

    this.log("diff = " + ticks);

    let offset = this.state.activeMax - ticks;

    this.log("new tick = " + offset);

    return offset;
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentWillReceiveProps = nextProps => {
    this.log("TimeScrubber:: componentWillReceiveProps");

    this.log("activeDate : " + nextProps.updatedDate);

    //if change the active clicked record, then update scrub position

    if (
      nextProps.updatedDate != null &&
      this.lastUpdatedDate !== nextProps.updatedDate
    ) {
      this.lastUpdatedDate = nextProps.updatedDate;

      let tick = this.fromDateToTick(nextProps.updatedDate);
      let newDate = this.fromTickToDate(tick);

      this.setState({
        activeTick: tick,
        activeDate: newDate
      });
    }
  };

  /// called when the range slider changes
  handleRangeChange = e => {
    console.log("[ConsoleTabs] range change -> " + e.target.value);

    let newTick = e.target.value;
    let newDate = this.fromTickToDate(newTick);
    let newDateObj = this.fromTickToDateObj(newTick);

    this.setState({
      activeTick: newTick,
      activeDate: newDate
    });

    this.props.onChangeScrubPosition(newTick, newDateObj);
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
                        <div className="title">{this.state.nowShowing}</div>
                        <div className="date">{this.state.activeDate}</div>
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
                      <i className="date">{this.state.activeDate}</i>
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
