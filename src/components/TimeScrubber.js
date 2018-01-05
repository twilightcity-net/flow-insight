import React, { Component } from "react";
import { Divider, Grid, Input, Popup, Segment } from "semantic-ui-react";
import moment from "moment";

//
// this component is the tab panel wrapper for the console content
//
export default class TimeScrubber extends Component {
  constructor(props) {
    super(props);
    this.date = new Date(2017, 3, 7);
  }

  /// called when the range slider changes
  handleRangeChange = e => {
    console.log("[ConsoleTabs] range change -> " + e.target.value);
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
                    max={64}
                    onChange={this.handleRangeChange}
                  />
                </Grid.Column>

                <Grid.Column className="info">
                  <Popup
                    trigger={
                      <div>
                        <div className="title">
                          Eu quo homero blandit intellegebat. Te eum doming
                          eirmod, nominati pertinacia argumentum ad his.
                        </div>
                        <div className="date">
                          {moment(this.date).format("ddd, MMM Do 'YY, h:mm a")}
                        </div>
                      </div>
                    }
                    className="timeScrubber"
                    position="bottom right"
                    on="hover"
                    inverted
                    wide
                  >
                    <Popup.Header>
                      {moment(this.date).format("dddd, MMMM Do YYYY, h:mm a")}
                    </Popup.Header>
                    <Popup.Content>
                      <Divider />
                      Eu quo homero blandit intellegebat. Te eum doming eirmod,
                      nominati pertinacia argumentum ad his.
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
