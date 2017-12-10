import React, { Component } from "react";
import { Grid, Segment } from "semantic-ui-react";
import TimeScrubber from "./TimeScrubber";
import JournalItems from "./JournalItems";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class Journal extends Component {
  constructor(props) {
    super(props);
  }

  /*
   * renders the tab component of the console view
   */
  render() {
    return (
      <div id="component" className="journal">
        <div id="wrapper" className="timeScrubber">
          <TimeScrubber />
        </div>
        <div id="wrapper" className="journalItems">
          <JournalItems />
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
    );
  }
}
