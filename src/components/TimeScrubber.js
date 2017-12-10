import React, { Component } from "react";
import { Grid, Input, Popup, Segment } from "semantic-ui-react";
import moment from "moment";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class TimeScrubber extends Component {
  constructor(props) {
    super(props);
    this.date = new Date(2017, 3, 7);
  }

  handleRangeChange = e => {
    console.log("[ConsoleTabs] range change -> " + e.target.value);
  };

  /*
   * renders the tab component of the console view
   */
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
                          {moment(this.date).format(
                            "dddd, MMMM Do YYYY, h:mm a"
                          )}
                        </div>
                      </div>
                    }
                    className="timeScrubber"
                    content="Eu quo homero blandit intellegebat. Te eum doming eirmod, nominati pertinacia argumentum ad his."
                    position="bottom right"
                    on="hover"
                    inverted
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
