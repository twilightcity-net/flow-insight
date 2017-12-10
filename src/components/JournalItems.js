import React, { Component } from "react";
import { Segment } from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class JournalItems extends Component {
  constructor(props) {
    super(props);
  }

  /*
   * renders the tab component of the console view
   */
  render() {
    return (
      <div id="component" className="journalItems">
        <Segment size="small" basic inverted>
          Te eum doming eirmod, nominati pertinacia argumentum ad his.
        </Segment>
        <Segment size="small" basic inverted>
          Pellentesque habitant morbi tristique senectus.
        </Segment>
        <Segment size="small" basic inverted>
          Eu quo homero blandit intellegebat. Incorrupte consequuntur mei id.
        </Segment>
        <Segment size="small" basic inverted>
          nominati quo argumentum tristique doming. homero senectus mei
          Pellentesque.
        </Segment>
        <Segment size="small" basic inverted>
          argumentum eirmod morbi Incorrupte intellegebat.
        </Segment>
        <Segment size="small" basic inverted>
          Eu quo homero blandit intellegebat. Incorrupte consequuntur mei id.
        </Segment>
      </div>
    );
  }
}
